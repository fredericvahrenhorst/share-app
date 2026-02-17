<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ t('favorites.title') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{ t('favorites.title') }}</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="p-4">
                <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-gray-500">
                    <ion-spinner name="crescent" />
                    <p class="mt-4">{{ t('favorites.loading') }}</p>
                </div>

                <div
                    v-else-if="!isAuthenticated"
                    class="flex flex-col items-center justify-center py-16 text-center text-gray-500"
                >
                    <ion-icon :icon="personCircleOutline" size="large" class="text-6xl mb-4" />
                    <h2 class="text-xl font-semibold mb-2">{{ t('favorites.login_required_title') }}</h2>
                    <p class="text-sm mb-4">{{ t('favorites.login_required_description') }}</p>
                    <ion-button fill="outline" @click="goToLogin">
                        {{ t('favorites.login') }}
                    </ion-button>
                </div>

                <div
                    v-else-if="favorites.length === 0"
                    class="flex flex-col items-center justify-center py-16 text-center text-gray-500"
                >
                    <ion-icon :icon="heartOutline" size="large" class="text-6xl mb-4" />
                    <h2 class="text-xl font-semibold mb-2">{{ t('favorites.empty_title') }}</h2>
                    <p class="text-sm">{{ t('favorites.empty_description') }}</p>
                </div>

                <ion-list v-else class="space-y-2">
                    <ion-item
                        v-for="favorite in favorites"
                        :key="favorite.id"
                        button
                        class="rounded-xl mb-2"
                        @click="openFavorite(favorite)"
                    >
                        <ion-thumbnail slot="start" class="rounded-lg overflow-hidden">
                            <ion-img
                                v-if="getFavoriteImage(favorite)"
                                :src="getFavoriteImageUrl(favorite)"
                                :alt="getLocationName(favorite)"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center bg-gray-200"
                            >
                                <ion-icon :icon="locationOutline" class="text-2xl text-gray-400" />
                            </div>
                        </ion-thumbnail>
                        <ion-label>
                            <h2 class="font-semibold">{{ getLocationName(favorite) }}</h2>
                            <p class="text-sm text-gray-600">{{ formatAddress(getLocation(favorite)?.address) }}</p>
                            <p v-if="getLocation(favorite)?.category?.name" class="text-xs text-gray-500">
                                {{ getLocation(favorite).category.name }}
                            </p>
                        </ion-label>
                        <ion-button
                            slot="end"
                            fill="clear"
                            color="danger"
                            @click.stop="handleRemoveFavorite(favorite)"
                        >
                            <ion-icon :icon="heart" />
                        </ion-button>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonImg,
} from '@ionic/vue'
import { heart, heartOutline, personCircleOutline, locationOutline } from 'ionicons/icons'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { onMounted, computed } from 'vue'

import { useFavoritesStore } from '../store/favoritesStore'
import { useUserStore } from '../store/userStore'
import { useLocationsStore } from '../store/locationsStore'

const { t } = useI18n()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const userStore = useUserStore()
const locationsStore = useLocationsStore()

const { favorites, isLoading } = storeToRefs(favoritesStore)
const isAuthenticated = computed(() => userStore.authenticated)

function getLocation(favorite) {
    return favorite?.location || favorite
}

function getLocationName(favorite) {
    return getLocation(favorite)?.name || ''
}

function getFavoriteImage(favorite) {
    const loc = getLocation(favorite)
    const firstImage = loc?.images?.[0]?.image
    return firstImage?.url || firstImage
}

function getFavoriteImageUrl(favorite) {
    const url = getFavoriteImage(favorite)
    if (!url) return ''
    return url.startsWith('http') ? url : `${(process.env.API_URL || '').replace(/\/api\/?$/, '')}${url}`
}

function formatAddress(address) {
    if (!address) return ''
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`)
    } else if (address.city) {
        parts.push(address.city)
    }
    if (address.country) parts.push(address.country)
    return parts.join(', ')
}

function openFavorite(favorite) {
    const loc = getLocation(favorite)
    if (loc) {
        locationsStore.setPopupLocation(loc)
        router.push({ name: 'Home' })
    }
}

async function handleRemoveFavorite(favorite) {
    try {
        await favoritesStore.removeFavorite(favorite.id)
    } catch (err) {
        // apiCall zeigt bereits Toast bei Fehler
    }
}

function goToLogin() {
    router.push({ name: 'Login', query: { redirect: '/favoriten' } })
}

onMounted(async () => {
    if (isAuthenticated.value) {
        await favoritesStore.fetchFavorites()
    }
})
</script>
