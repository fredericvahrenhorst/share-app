<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/home" />
                </ion-buttons>
                <ion-title>{{ t('activity.title') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <div class="p-4">
                <div v-if="isLoading && activities.length === 0" class="text-center py-12">
                    <ion-spinner name="crescent" />
                    <p class="text-sm text-gray-500 mt-2">{{ t('activity.loading') }}</p>
                </div>

                <div v-else-if="activities.length === 0" class="text-center py-12">
                    <p class="text-lg font-semibold text-gray-600 mb-2">{{ t('activity.empty_title') }}</p>
                    <p class="text-sm text-gray-500">{{ t('activity.empty_description') }}</p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="activity in activities"
                        :key="activity.id"
                        class="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <div
                            class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                            :class="activityIconClass(activity.type)"
                        >
                            {{ activityIcon(activity.type) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-800">
                                <strong>{{ activity.actor?.name || 'Unbekannt' }}</strong>
                                {{ activityVerb(activity.type) }}
                                <strong v-if="activity.location?.name">{{ activity.location.name }}</strong>
                                <span
                                    v-if="activity.type === 'badge_earned' && activity.metadata?.badge"
                                >
                                    „{{ badgeLabel(activity.metadata.badge) }}"
                                </span>
                            </p>
                            <p class="text-xs text-gray-400 mt-0.5">
                                {{ formatTimeAgo(activity.createdAt) }}
                            </p>
                        </div>
                    </div>

                    <div v-if="hasNextPage" class="text-center pt-2 pb-4">
                        <ion-button fill="clear" size="small" :disabled="isLoading" @click="loadMore">
                            <ion-spinner v-if="isLoading" name="crescent" class="mr-1" />
                            {{ t('activity.load_more') }}
                        </ion-button>
                    </div>
                </div>
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
    IonButtons,
    IonBackButton,
    IonButton,
    IonSpinner,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useActivityStore } from '../store/activityStore'

const { t } = useI18n()
const activityStore = useActivityStore()
const { activities, isLoading, hasNextPage } = storeToRefs(activityStore)

const ACTIVITY_CONFIG = {
    location_created: { icon: '📍', verb: 'hat einen neuen Standort erstellt:', class: 'bg-blue-100' },
    review_added: { icon: '⭐', verb: 'hat eine Bewertung geschrieben für', class: 'bg-yellow-100' },
    location_verified: { icon: '✅', verb: 'hat den Standort verifiziert:', class: 'bg-green-100' },
    badge_earned: { icon: '🏅', verb: 'hat ein Badge erhalten:', class: 'bg-purple-100' },
    location_confirmed: { icon: '👍', verb: 'hat einen Standort bestätigt:', class: 'bg-orange-100' },
}

const BADGE_LABELS = {
    creator: 'Ersteller',
    verified: 'Verifiziert',
    helper: 'Community-Helfer',
    moderator: 'Moderator',
}

function activityIcon(type) {
    return ACTIVITY_CONFIG[type]?.icon || '📋'
}

function activityIconClass(type) {
    return ACTIVITY_CONFIG[type]?.class || 'bg-gray-100'
}

function activityVerb(type) {
    return ACTIVITY_CONFIG[type]?.verb || 'hat etwas getan'
}

function badgeLabel(badge) {
    return BADGE_LABELS[badge] || badge
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'gerade eben'
    if (diffMin < 60) return `vor ${diffMin} Min.`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `vor ${diffHours} Std.`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE')
}

function loadMore() {
    activityStore.loadMore()
}

onMounted(() => {
    activityStore.fetchActivities(1)
})
</script>
