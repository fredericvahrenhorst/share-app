<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ t('profile.title') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{ t('profile.title') }}</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="p-4" style="padding-bottom: var(--tab-bar-height)">
                <!-- Gast-Zustand -->
                <div
                    v-if="!isAuthenticated"
                    class="flex flex-col items-center justify-center py-16 text-center"
                >
                    <ion-icon :icon="personCircleOutline" size="large" class="text-6xl mb-4 text-gray-400" />
                    <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ t('profile.not_logged_in') }}</h2>
                    <p class="text-sm text-gray-600 mb-4">{{ t('profile.login_prompt') }}</p>
                    <ion-button fill="outline" @click="goToLogin">
                        {{ t('profile.login') }}
                    </ion-button>
                </div>

                <template v-else>
                    <!-- Profil Header -->
                    <div class="flex flex-col items-center py-6 mb-4">
                        <ion-avatar class="w-20 h-20 mb-3">
                            <ion-img
                                v-if="avatarUrl"
                                :src="avatarUrl"
                                :alt="user?.name"
                                class="object-cover w-full h-full"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center bg-gray-200 rounded-full"
                            >
                                <ion-icon :icon="personCircleOutline" class="text-4xl text-gray-500" />
                            </div>
                        </ion-avatar>
                        <h2 class="text-xl font-semibold text-gray-800 m-0 mb-1">{{ user?.name || '–' }}</h2>
                        <p class="text-sm text-gray-600 m-0">{{ user?.email || '–' }}</p>
                        <ion-button fill="outline" size="small" class="mt-3" @click="openEditProfile">
                            <ion-icon :icon="createOutline" slot="start" />
                            {{ t('profile.edit_title') }}
                        </ion-button>
                    </div>

                    <!-- Profil Optionen -->
                    <ion-list class="rounded-xl overflow-hidden mb-6">
                        <ion-item button @click="openSettings" class="rounded-none">
                            <ion-icon :icon="settings" slot="start" />
                            <ion-label>{{ t('profile.settings') }}</ion-label>
                            <ion-icon :icon="chevronForward" slot="end" />
                        </ion-item>
                        <ion-item button @click="openNotifications" class="rounded-none">
                            <ion-icon :icon="notifications" slot="start" />
                            <ion-label>{{ t('profile.notifications') }}</ion-label>
                            <ion-icon :icon="chevronForward" slot="end" />
                        </ion-item>
                        <ion-item button @click="openPrivacy" class="rounded-none">
                            <ion-icon :icon="shield" slot="start" />
                            <ion-label>{{ t('profile.privacy') }}</ion-label>
                            <ion-icon :icon="chevronForward" slot="end" />
                        </ion-item>
                        <ion-item button @click="openHelp" class="rounded-none">
                            <ion-icon :icon="helpCircle" slot="start" />
                            <ion-label>{{ t('profile.help') }}</ion-label>
                            <ion-icon :icon="chevronForward" slot="end" />
                        </ion-item>
                        <ion-item button @click="openAbout" class="rounded-none">
                            <ion-icon :icon="informationCircle" slot="start" />
                            <ion-label>{{ t('profile.about') }}</ion-label>
                            <ion-icon :icon="chevronForward" slot="end" />
                        </ion-item>
                    </ion-list>

                    <!-- Statistiken -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">{{ t('profile.activity') }}</h3>
                        <div class="grid grid-cols-3 gap-4">
                            <div class="flex flex-col items-center p-4 bg-gray-100 rounded-xl">
                                <span class="text-2xl font-bold text-primary">{{ favoritesCount }}</span>
                                <span class="text-xs text-gray-600 uppercase tracking-wide mt-1">
                                    {{ t('profile.favorites_count') }}
                                </span>
                            </div>
                            <div class="flex flex-col items-center p-4 bg-gray-100 rounded-xl">
                                <span class="text-2xl font-bold text-primary">–</span>
                                <span class="text-xs text-gray-600 uppercase tracking-wide mt-1">
                                    {{ t('profile.visited_count') }}
                                </span>
                            </div>
                            <div class="flex flex-col items-center p-4 bg-gray-100 rounded-xl">
                                <span class="text-2xl font-bold text-primary">–</span>
                                <span class="text-xs text-gray-600 uppercase tracking-wide mt-1">
                                    {{ t('profile.reviews_count') }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Abmelden -->
                    <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
                        <ion-icon :icon="logOut" slot="start" />
                        {{ t('profile.logout') }}
                    </ion-button>
                </template>
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
    IonIcon,
    IonLabel,
    IonAvatar,
    IonButton,
    IonImg,
} from '@ionic/vue'
import {
    settings,
    notifications,
    shield,
    helpCircle,
    informationCircle,
    chevronForward,
    logOut,
    personCircleOutline,
    createOutline,
} from 'ionicons/icons'
import { modalController } from '@ionic/vue'
import EditProfileModal from '../components/EditProfileModal.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { toastController } from '@ionic/vue'

import { useUserStore } from '../store/userStore'
import { useFavoritesStore } from '../store/favoritesStore'
import useAvatarUrl from '../composables/useAvatarUrl'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

const { user, authenticated: isAuthenticated } = storeToRefs(userStore)
const { favorites } = storeToRefs(favoritesStore)

const favoritesCount = computed(() => favorites.value?.length ?? 0)

const avatarUrl = computed(() => useAvatarUrl(user.value?.avatar))

function goToLogin() {
    router.push({ name: 'Login', query: { redirect: '/profil' } })
}

async function handleLogout() {
    try {
        await userStore.logout()
        await favoritesStore.fetchFavorites()
        router.push({ name: 'Home' })
    } catch (err) {
        router.push({ name: 'Home' })
    }
}

async function showInDevelopmentToast() {
    const toast = await toastController.create({
        message: t('profile.in_development'),
        duration: 2000,
        position: 'bottom',
    })
    await toast.present()
}

function openSettings() {
    showInDevelopmentToast()
}

function openNotifications() {
    showInDevelopmentToast()
}

function openPrivacy() {
    showInDevelopmentToast()
}

function openHelp() {
    showInDevelopmentToast()
}

function openAbout() {
    showInDevelopmentToast()
}

async function openEditProfile() {
    const modal = await modalController.create({
        component: EditProfileModal,
    })
    await modal.present()
    const { data } = await modal.onWillDismiss()
    if (data) {
        await userStore.getUserData()
    }
}

onMounted(async () => {
    if (isAuthenticated.value && userStore.userId) {
        try {
            await userStore.getUserData()
        } catch (err) {
            // Fehler beim Laden – User bleibt leer
        }
    }
    if (isAuthenticated.value) {
        await favoritesStore.fetchFavorites()
    }
})
</script>
