<template>
    <ion-modal
        ref="locationModal"
        :is-open="!!popupLocation"
        :initial-breakpoint="0.5"
        :breakpoints="[0, 0.5, 0.75, 1]"
        @didDismiss="handleDidDismiss"
        class="popupLocation"
    >
        <ion-header collapse="fade" translucent>
            <ion-toolbar>
                <div v-if="popupLocation?.category" class="flex items-center mb-2">
                    <ion-icon :icon="categoryIcon" class="text-xl mr-2" />
                    <span class="text-sm text-gray-500">{{ popupLocation.category?.name }}</span>
                    <span
                        v-if="popupLocation?.status && popupLocation.status !== 'active'"
                        class="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800"
                    >
                        {{ t('locationDetail.status_pending') }}
                    </span>
                </div>
                <ion-title class="flex items-center gap-2">
                    {{ popupLocation?.name }}
                    <ion-icon
                        v-if="popupLocation?.verified"
                        :icon="checkmarkCircleOutline"
                        class="text-green-500 shrink-0"
                        title="Verifiziert"
                    />
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleDismiss">
                        <ion-icon size="small" color="primary" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Bewertungen -->
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <ion-icon :icon="star" class="text-yellow-400 mr-1" />
                        <span class="font-bold text-lg mr-1">
                            {{ popupLocation?.averageRating || '-' }}
                        </span>
                        <span class="text-sm text-gray-500">
                            ({{ popupLocation?.reviewCount || 0 }} Bewertungen)
                        </span>
                    </div>
                    <ion-button
                        v-if="isAuthenticated && !showReviewForm"
                        size="small"
                        fill="outline"
                        @click="showReviewForm = true"
                    >
                        Bewerten
                    </ion-button>
                </div>

                <!-- Review Form -->
                <div v-if="showReviewForm" class="bg-gray-50 p-3 rounded-lg mb-3">
                    <h4 class="font-semibold mb-2">Deine Bewertung</h4>
                    <div class="flex gap-2 mb-2">
                        <ion-icon
                            v-for="i in 5"
                            :key="i"
                            :icon="i <= newReviewRating ? star : starOutline"
                            class="text-2xl cursor-pointer text-yellow-400"
                            @click="newReviewRating = i"
                        />
                    </div>
                    <ion-textarea
                        v-model="newReviewComment"
                        placeholder="Dein Kommentar (optional)"
                        rows="3"
                        class="bg-white rounded-md border border-gray-200 mb-2"
                    />
                    <div class="flex justify-end gap-2">
                        <ion-button size="small" fill="clear" @click="showReviewForm = false">Abbrechen</ion-button>
                        <ion-button
                            size="small"
                            :disabled="newReviewRating === 0 || isSubmittingReview"
                            @click="submitReview"
                        >
                            <ion-spinner v-if="isSubmittingReview" name="crescent" class="mr-1" />
                            Senden
                        </ion-button>
                    </div>
                </div>

                <!-- Reviews List -->
                <div v-if="isReviewsLoading" class="text-center py-4">
                    <ion-spinner name="crescent" />
                </div>
                <div v-else-if="reviews.length > 0" class="space-y-3">
                    <div v-for="review in reviews" :key="review.id" class="border-b pb-2 last:border-0">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center gap-2 mb-1">
                                <ion-icon :icon="personCircleOutline" class="text-gray-400" />
                                <span class="font-medium text-sm">{{ review.user?.name || 'Unbekannt' }}</span>
                            </div>
                            <span class="text-xs text-gray-400">
                                {{ new Date(review.createdAt).toLocaleDateString() }}
                            </span>
                        </div>
                        <div class="flex items-center mb-1">
                            <ion-icon
                                v-for="i in 5"
                                :key="i"
                                :icon="star"
                                class="text-xs"
                                :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-200'"
                            />
                        </div>
                        <p v-if="review.comment" class="text-sm text-gray-700">{{ review.comment }}</p>
                    </div>
                </div>
                <p v-else class="text-sm text-gray-500 italic">Noch keine Bewertungen vorhanden.</p>
            </div>

            <!-- Bildbereich (erstes Bild groß, weitere als Galerie) -->
            <div class="mb-4">
                <div
                    class="rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center h-40"
                >
                    <ion-img
                        v-if="firstImageUrl"
                        :src="firstImageUrl"
                        :alt="popupLocation?.name"
                        class="object-cover w-full h-full"
                    />
                    <ion-icon v-else :icon="categoryIcon" class="text-5xl text-indigo-400" />
                </div>
                <div
                    v-if="allImageUrls.length > 1"
                    class="flex gap-2 mt-2 overflow-x-auto pb-1"
                >
                    <div
                        v-for="(url, idx) in allImageUrls"
                        :key="idx"
                        class="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                    >
                        <ion-img :src="url" :alt="`${popupLocation?.name} ${idx + 1}`" class="object-cover w-full h-full" />
                    </div>
                </div>
            </div>

            <!-- Beschreibung -->
            <div v-if="descriptionText" class="mb-4">
                <h3 class="font-semibold mb-1">{{ t('locationDetail.description') }}</h3>
                <p class="text-gray-700 whitespace-pre-wrap">{{ descriptionText }}</p>
            </div>

            <!-- Regeln (falls vorhanden) -->
            <div v-if="popupLocation?.rules" class="mb-4">
                <h3 class="font-semibold mb-1">Regeln / Hinweise</h3>
                <p class="text-gray-700 whitespace-pre-wrap">{{ popupLocation.rules }}</p>
            </div>

            <!-- Tags -->
            <div v-if="locationTags.length > 0" class="mb-4">
                <h3 class="font-semibold mb-2">{{ t('locationDetail.tags') }}</h3>
                <div class="flex flex-wrap gap-2">
                    <span
                        v-for="tag in locationTags"
                        :key="tag"
                        class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>

            <!-- Barrierefreiheit -->
            <div v-if="hasAccessibility" class="mb-4">
                <h3 class="font-semibold mb-2">{{ t('locationDetail.accessibility') }}</h3>
                <div class="space-y-1">
                    <div v-if="popupLocation?.accessibility?.wheelchairAccessible" class="flex items-center text-gray-700">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-green-500 mr-2 shrink-0" />
                        {{ t('locationDetail.wheelchair_accessible') }}
                    </div>
                    <div v-if="popupLocation?.accessibility?.accessibleToilet" class="flex items-center text-gray-700">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-green-500 mr-2 shrink-0" />
                        {{ t('locationDetail.accessible_toilet') }}
                    </div>
                    <div v-if="popupLocation?.accessibility?.accessibleParking" class="flex items-center text-gray-700">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-green-500 mr-2 shrink-0" />
                        {{ t('locationDetail.accessible_parking') }}
                    </div>
                </div>
            </div>

            <!-- Info-Karten -->
            <div class="space-y-2 mb-4">
                <div v-if="formatAddress(popupLocation?.address)" class="flex items-center bg-blue-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="locationOutline" class="text-blue-400 mr-2 shrink-0" />
                    <div class="min-w-0">
                        <span class="font-medium block">{{ t('locationDetail.address') }}</span>
                        <span class="text-gray-700">{{ formatAddress(popupLocation?.address) }}</span>
                    </div>
                </div>
                <div v-if="availabilityText" class="flex items-center bg-purple-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="timeOutline" class="text-purple-400 mr-2 shrink-0" />
                    <div class="min-w-0">
                        <span class="font-medium block">{{ t('locationDetail.availability') }}</span>
                        <span class="text-gray-700">{{ availabilityText }}</span>
                    </div>
                </div>
            </div>

            <!-- Kontakt -->
            <div v-if="hasContact" class="mb-4">
                <h3 class="font-semibold mb-1">{{ t('locationDetail.contact') }}</h3>
                <div class="flex flex-col gap-1">
                    <a
                        v-if="popupLocation?.contact?.email"
                        :href="`mailto:${popupLocation.contact.email}`"
                        class="flex items-center text-blue-600 hover:underline"
                    >
                        <ion-icon :icon="mailOutline" class="mr-2" />{{ popupLocation.contact.email }}
                    </a>
                    <a
                        v-if="popupLocation?.contact?.website"
                        :href="popupLocation.contact.website"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center text-blue-600 hover:underline"
                    >
                        <ion-icon :icon="globeOutline" class="mr-2" />Website besuchen
                    </a>
                    <span v-if="popupLocation?.contact?.phone" class="flex items-center text-gray-700">
                        <ion-icon :icon="callOutline" class="mr-2" />{{ popupLocation.contact.phone }}
                    </span>
                </div>
            </div>

            <!-- Aktionen -->
            <div class="flex justify-between border-t pt-3">
                <ion-button
                    fill="clear"
                    class="flex-1 flex flex-col items-center"
                    :disabled="!isAuthenticated"
                    @click="handleFavoriteClick"
                >
                    <ion-icon :icon="isFavorite ? heart : heartOutline" :color="isFavorite ? 'danger' : undefined" />
                    <span class="text-xs mt-1">{{ isFavorite ? t('favorites.remove') : t('favorites.add') }}</span>
                </ion-button>
                <ion-button fill="clear" class="flex-1 flex flex-col items-center" @click="handleShare">
                    <ion-icon :icon="shareOutline" />
                    <span class="text-xs mt-1">{{ t('locationDetail.share') }}</span>
                </ion-button>
                <ion-button
                    fill="solid"
                    color="primary"
                    class="flex-1 flex flex-col items-center"
                    @click="handleRoute"
                >
                    <ion-icon :icon="navigateOutline" />
                    <span class="text-xs mt-1">{{ t('locationDetail.route') }}</span>
                </ion-button>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import {
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonModal,
    IonImg,
    IonTextarea,
    IonSpinner,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import {
    locationOutline,
    timeOutline,
    mailOutline,
    globeOutline,
    callOutline,
    heartOutline,
    heart,
    shareOutline,
    navigateOutline,
    closeOutline,
    star,
    starOutline,
    personCircleOutline,
    checkmarkCircleOutline,
} from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useLocationsStore } from '../store/locationsStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useUserStore } from '../store/userStore'
import { useReviewsStore } from '../store/reviewsStore'

const locationsStore = useLocationsStore()
const favoritesStore = useFavoritesStore()
const userStore = useUserStore()
const reviewsStore = useReviewsStore()

const { popupLocation } = storeToRefs(locationsStore)
const { t } = useI18n()
const locationModal = ref(null)

// Reviews State
const reviews = computed(() => {
    const id = popupLocation.value?.id
    return id ? reviewsStore.getReviewsByLocationId(id) : []
})
const isReviewsLoading = ref(false)
const showReviewForm = ref(false)
const newReviewRating = ref(0)
const newReviewComment = ref('')
const isSubmittingReview = ref(false)

// Watch popupLocation to fetch reviews
watch(
    () => popupLocation.value?.id,
    async (newId) => {
        if (newId) {
            isReviewsLoading.value = true
            await reviewsStore.fetchReviews(newId)
            isReviewsLoading.value = false
            // Reset Form
            showReviewForm.value = false
            newReviewRating.value = 0
            newReviewComment.value = ''
        }
    }
)

const categoryIcon = computed(() => popupLocation.value?.category?.icon || locationOutline)

const isAuthenticated = computed(() => userStore.authenticated)

const isFavorite = computed(() => {
    const id = popupLocation.value?.id
    return id ? favoritesStore.isFavorite(id) : false
})

const currentFavorite = computed(() => {
    const id = popupLocation.value?.id
    return id ? favoritesStore.getFavoriteByLocationId(id) : null
})

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

function extractDescriptionText(desc) {
    if (!desc) return ''
    if (typeof desc === 'string') return desc.trim()
    if (desc?.root?.children) {
        return desc.root.children
            .map((c) => c?.text || '')
            .join('')
            .trim()
    }
    return ''
}

const descriptionText = computed(() =>
    extractDescriptionText(popupLocation.value?.description)
)

function formatAvailability(oh) {
    if (!oh) return ''
    if (oh.is24_7) return '24/7 geöffnet'
    const schedule = oh.schedule || []
    if (schedule.length === 0) return ''
    return schedule
        .map((s) => {
            const day = s.day ? String(s.day).slice(0, 2) : ''
            const open = s.open || '–'
            const close = s.close || '–'
            return `${day} ${open}–${close}`
        })
        .join(', ')
}

const availabilityText = computed(() =>
    formatAvailability(popupLocation.value?.openingHours)
)

const hasContact = computed(
    () =>
        popupLocation.value?.contact?.email ||
        popupLocation.value?.contact?.website ||
        popupLocation.value?.contact?.phone
)

const locationTags = computed(() => {
    const tags = popupLocation.value?.tags
    if (!Array.isArray(tags)) return []
    return tags.map((t) => t?.tag).filter(Boolean)
})

const hasAccessibility = computed(
    () =>
        popupLocation.value?.accessibility?.wheelchairAccessible ||
        popupLocation.value?.accessibility?.accessibleToilet ||
        popupLocation.value?.accessibility?.accessibleParking
)

function getImageUrl(img) {
    const url = img?.url || (typeof img === 'object' ? img?.url : null)
    if (!url) return ''
    return url.startsWith('http') ? url : `${(process.env.API_URL || '').replace(/\/api\/?$/, '')}${url}`
}

const firstImageUrl = computed(() => {
    const loc = popupLocation.value
    if (!loc?.images?.length) return ''
    return getImageUrl(loc.images[0]?.image)
})

const allImageUrls = computed(() => {
    const loc = popupLocation.value
    if (!loc?.images?.length) return []
    return loc.images.map((item) => getImageUrl(item?.image)).filter(Boolean)
})

function handleDismiss() {
    if (locationModal.value?.$el) {
        locationModal.value.$el.dismiss()
    }
}

function handleDidDismiss() {
    locationsStore.clearPopupLocation()
}

async function handleFavoriteClick() {
    if (!isAuthenticated.value) return
    const id = popupLocation.value?.id
    if (!id) return

    try {
        if (isFavorite.value && currentFavorite.value) {
            await favoritesStore.removeFavorite(currentFavorite.value.id)
        } else {
            await favoritesStore.addFavorite(id)
        }
    } catch (err) {
        // apiCall zeigt Toast bei Fehler
    }
}

function handleShare() {
    const loc = popupLocation.value
    if (!loc) return
    const name = loc.name || ''
    const address = formatAddress(loc.address)
    const text = address ? `${name} – ${address}` : name
    const url = loc.coordinates?.length === 2
        ? `https://www.google.com/maps?q=${loc.coordinates[1]},${loc.coordinates[0]}`
        : ''

    if (navigator.share) {
        navigator.share({
            title: name,
            text,
            url: url || window.location.href,
        }).catch(() => {})
    } else {
        navigator.clipboard?.writeText(text + (url ? ` ${url}` : '')).catch(() => {})
    }
}

function handleRoute() {
    const loc = popupLocation.value
    if (!loc?.coordinates || loc.coordinates.length !== 2) return
    const [lng, lat] = loc.coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
}

async function submitReview() {
    if (newReviewRating.value === 0) return
    isSubmittingReview.value = true
    try {
        await reviewsStore.addReview({
            locationId: popupLocation.value.id,
            rating: newReviewRating.value,
            comment: newReviewComment.value,
            userId: userStore.userId || userStore.user?.id,
        })
        showReviewForm.value = false
        newReviewRating.value = 0
        newReviewComment.value = ''
        // Location neu laden um Stats zu aktualisieren
        // locationsStore.fetchLocation(popupLocation.value.id) // Falls vorhanden
    } catch (e) {
        // Error handling in store/apiCall
    } finally {
        isSubmittingReview.value = false
    }
}
</script>
