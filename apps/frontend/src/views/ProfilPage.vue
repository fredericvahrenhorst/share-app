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
                        <ion-item class="rounded-none">
                            <ion-icon :icon="notifications" slot="start" />
                            <ion-toggle
                                :checked="notificationsEnabled"
                                @ionChange="toggleNotifications($event)"
                            >
                                <ion-label>{{ t('profile.notifications') }}</ion-label>
                            </ion-toggle>
                        </ion-item>
                        <ion-item class="rounded-none">
                            <ion-icon :icon="shield" slot="start" />
                            <ion-label>{{ t('profile.privacy') }}</ion-label>
                            <ion-select
                                :value="privacySetting"
                                interface="popover"
                                @ionChange="changePrivacy($event)"
                            >
                                <ion-select-option value="public">{{ t('profile.privacy_public') }}</ion-select-option>
                                <ion-select-option value="friends">{{ t('profile.privacy_friends') }}</ion-select-option>
                                <ion-select-option value="private">{{ t('profile.privacy_private') }}</ion-select-option>
                            </ion-select>
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

                    <!-- Reputation & Badges -->
                    <div v-if="user?.reputation !== undefined" class="mb-6">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold text-gray-800">{{ t('profile.reputation') }}</h3>
                            <span
                                class="text-sm font-medium px-3 py-1 rounded-full"
                                :class="reputationLevelClass"
                            >
                                {{ reputationLevelLabel }}
                            </span>
                        </div>
                        <div class="bg-gray-100 rounded-full h-2 mb-2">
                            <div
                                class="h-2 rounded-full transition-all duration-500"
                                :class="reputationBarClass"
                                :style="{ width: reputationBarWidth + '%' }"
                            />
                        </div>
                        <p class="text-xs text-gray-500 text-right">{{ user.reputation || 0 }} {{ t('profile.points') }}</p>
                    </div>

                    <div v-if="userBadges.length > 0" class="mb-6">
                        <h3 class="text-lg font-semibold mb-3 text-gray-800">{{ t('profile.badges') }}</h3>
                        <div class="flex flex-wrap gap-2">
                            <div
                                v-for="badge in userBadges"
                                :key="badge.badge"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                                :class="badgeClass(badge.badge)"
                            >
                                <span>{{ badgeIcon(badge.badge) }}</span>
                                <span>{{ badgeLabel(badge.badge) }}</span>
                            </div>
                        </div>
                    </div>

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
                                <span class="text-2xl font-bold text-primary">{{ user?.stats?.locationsCreated || 0 }}</span>
                                <span class="text-xs text-gray-600 uppercase tracking-wide mt-1">
                                    {{ t('profile.locations_count') }}
                                </span>
                            </div>
                            <div class="flex flex-col items-center p-4 bg-gray-100 rounded-xl">
                                <span class="text-2xl font-bold text-primary">{{ user?.stats?.reviewsWritten || 0 }}</span>
                                <span class="text-xs text-gray-600 uppercase tracking-wide mt-1">
                                    {{ t('profile.reviews_count') }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Community Feed -->
                    <ion-button expand="block" fill="outline" class="mb-4" @click="goToActivityFeed">
                        <ion-icon :icon="peopleOutline" slot="start" />
                        {{ t('profile.activity_feed') }}
                    </ion-button>

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
    IonToggle,
    IonSelect,
    IonSelectOption,
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
    peopleOutline,
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

const notificationsEnabled = computed(() => user.value?.preferences?.notifications ?? true)
const privacySetting = computed(() => user.value?.preferences?.privacy || 'public')

async function toggleNotifications(event) {
    const enabled = event.detail.checked
    try {
        await userStore.updateUser({
            preferences: { ...user.value?.preferences, notifications: enabled },
        })
    } catch (err) {
        // apiCall zeigt Toast
    }
}

async function changePrivacy(event) {
    const value = event.detail.value
    try {
        await userStore.updateUser({
            preferences: { ...user.value?.preferences, privacy: value },
        })
    } catch (err) {
        // apiCall zeigt Toast
    }
}

const REPUTATION_LEVEL_LABELS = {
    newcomer: 'Neuling',
    active: 'Aktiver Teiler',
    hero: 'Community-Held',
    legend: 'Legende',
}

const reputationLevelLabel = computed(() =>
    REPUTATION_LEVEL_LABELS[user.value?.reputationLevel] || REPUTATION_LEVEL_LABELS.newcomer
)

const reputationLevelClass = computed(() => {
    const level = user.value?.reputationLevel || 'newcomer'
    return {
        newcomer: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        hero: 'bg-purple-100 text-purple-700',
        legend: 'bg-yellow-100 text-yellow-700',
    }[level] || 'bg-gray-100 text-gray-700'
})

const reputationBarClass = computed(() => {
    const level = user.value?.reputationLevel || 'newcomer'
    return {
        newcomer: 'bg-gray-400',
        active: 'bg-green-500',
        hero: 'bg-purple-500',
        legend: 'bg-yellow-500',
    }[level] || 'bg-gray-400'
})

const reputationBarWidth = computed(() => {
    const rep = user.value?.reputation || 0
    if (rep >= 100) return 100
    if (rep >= 50) return 75
    if (rep >= 15) return 45
    return Math.min((rep / 15) * 30, 30)
})

const userBadges = computed(() => user.value?.badges || [])

const BADGE_CONFIG = {
    creator: { label: 'Ersteller', icon: '🏗️', class: 'bg-blue-100 text-blue-700' },
    verified: { label: 'Verifiziert', icon: '✅', class: 'bg-green-100 text-green-700' },
    helper: { label: 'Community-Helfer', icon: '🤝', class: 'bg-orange-100 text-orange-700' },
    moderator: { label: 'Moderator', icon: '🛡️', class: 'bg-red-100 text-red-700' },
}

function badgeLabel(badge) {
    return BADGE_CONFIG[badge]?.label || badge
}

function badgeIcon(badge) {
    return BADGE_CONFIG[badge]?.icon || '🏅'
}

function badgeClass(badge) {
    return BADGE_CONFIG[badge]?.class || 'bg-gray-100 text-gray-700'
}

function goToActivityFeed() {
    router.push({ name: 'Activity' })
}

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
