<template>
    <ion-modal
        ref="locationModal"
        :is-open="!!popupLocation"
        :initial-breakpoint="0.5"
        :breakpoints="[0, 0.5, 0.75, 1]"
        @didDismiss="handleDidDismiss"
        class="popupLocation"
        role="dialog"
        :aria-label="popupLocation?.name || 'Location detail'"
    >
        <ion-header>
            <ion-toolbar>
                <div v-if="popupLocation?.category" class="flex items-center mb-2">
                    <CategoryIcon
                        :icon="popupLocation.category?.icon"
                        size-class="w-5 h-5 text-xl mr-2 text-accent-300"
                    />
                    <span class="text-sm text-white/70">{{ popupLocation.category?.name }}</span>
                    <span
                        v-if="popupLocation?.status && popupLocation.status !== 'active'"
                        class="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800"
                    >
                        {{ t('locationDetail.status_pending') }}
                    </span>
                </div>
                <ion-title class="flex items-center gap-2 text-white">
                    {{ popupLocation?.name }}
                    <ion-icon
                        v-if="popupLocation?.verified"
                        :icon="checkmarkCircleOutline"
                        class="text-accent-300 shrink-0"
                        :title="t('locationDetail.verified')"
                        :aria-label="t('locationDetail.verified')"
                    />
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="presentActionSheet" :aria-label="t('misc.more_options')">
                        <ion-icon :icon="ellipsisVertical" class="w-5 h-5" />
                    </ion-button>
                    <ion-button fill="clear" @click="handleDismiss" :aria-label="t('misc.close')">
                        <ion-icon :icon="closeOutline" class="w-5 h-5" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Header-Bewertung (Teaser) -->
            <div class="flex items-center mb-4">
                <ion-icon :icon="star" class="text-yellow-400 mr-1" />
                <span class="font-bold text-lg mr-1">
                    {{ popupLocation?.averageRating || '-' }}
                </span>
                <span class="text-sm text-neutral-400">
                    ({{ popupLocation?.reviewCount || 0 }} Bewertungen)
                </span>
            </div>

            <!-- Bildbereich: Snap-Slider (ein Bild pro Slide, Pfeile + Pagination) -->
            <div class="relative mb-4">
                <!-- Einzelbild oder Platzhalter -->
                <div
                    v-if="allImageUrls.length <= 1"
                    class="rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center h-56"
                >
                    <ion-img
                        v-if="firstImageUrl"
                        :src="firstImageUrl"
                        :alt="popupLocation?.name"
                        class="object-cover w-full h-full"
                    />
                    <CategoryIcon
                        v-else
                        :icon="popupLocation?.category?.icon"
                        size-class="w-16 h-16 text-neutral-300"
                    />
                </div>

                <!-- Snap-Slider bei mehreren Bildern -->
                <template v-else>
                    <!-- Pfeile -->
                    <button
                        type="button"
                        class="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity"
                        :class="{ 'opacity-0 pointer-events-none': imageSliderActiveIndex <= 0 }"
                        :aria-label="t('locationDetail.slider_previous')"
                        @click="imageSliderScrollToPrev"
                    >
                        <ion-icon :icon="chevronBackOutline" class="h-6 w-6 text-gray-700" />
                    </button>
                    <button
                        type="button"
                        class="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity"
                        :class="{
                            'opacity-0 pointer-events-none':
                                imageSliderActiveIndex >= allImageUrls.length - 1,
                        }"
                        :aria-label="t('locationDetail.slider_next')"
                        @click="imageSliderScrollToNext"
                    >
                        <ion-icon :icon="chevronForwardOutline" class="h-6 w-6 text-gray-700" />
                    </button>

                    <!-- Slider-Container -->
                    <div
                        ref="imageSliderRef"
                        class="relative flex w-full snap-x snap-mandatory overflow-x-auto rounded-xl scroll-smooth"
                        style="-webkit-overflow-scrolling: touch"
                        @scroll="onImageSliderScroll"
                    >
                        <div
                            v-for="(url, idx) in allImageUrls"
                            :key="idx"
                            class="min-w-full w-full shrink-0 snap-start"
                        >
                            <div
                                class="relative h-56 w-full overflow-hidden rounded-xl bg-neutral-100"
                            >
                                <ion-img
                                    :src="url"
                                    :alt="`${popupLocation?.name} ${idx + 1}`"
                                    class="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Pagination (Overlay unten) -->
                    <div
                        class="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2"
                    >
                        <button
                            v-for="(_, idx) in allImageUrls"
                            :key="`dot-${idx}`"
                            type="button"
                            class="pointer-events-auto rounded-full transition-colors"
                            :class="
                                idx === imageSliderActiveIndex
                                    ? 'h-2.5 w-2.5 bg-white shadow'
                                    : 'h-2 w-2 bg-white/60'
                            "
                            :aria-label="`Slide ${idx + 1}`"
                            :aria-current="idx === imageSliderActiveIndex ? 'true' : 'false'"
                            @click="imageSliderScrollToIndex(idx)"
                        />
                    </div>
                </template>
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
                    <div v-if="popupLocation?.accessibility?.wheelchairAccessible" class="flex items-center text-primary-600">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-success-500 mr-2 shrink-0" />
                        {{ t('locationDetail.wheelchair_accessible') }}
                    </div>
                    <div v-if="popupLocation?.accessibility?.accessibleToilet" class="flex items-center text-primary-600">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-success-500 mr-2 shrink-0" />
                        {{ t('locationDetail.accessible_toilet') }}
                    </div>
                    <div v-if="popupLocation?.accessibility?.accessibleParking" class="flex items-center text-primary-600">
                        <ion-icon :icon="checkmarkCircleOutline" class="text-success-500 mr-2 shrink-0" />
                        {{ t('locationDetail.accessible_parking') }}
                    </div>
                </div>
            </div>

            <!-- Info-Karten -->
            <div class="space-y-2 mb-4">
                <div v-if="formatAddress(popupLocation?.address)" class="flex items-center bg-blue-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="locationOutline" class="text-accent-300 mr-2 shrink-0" />
                    <div class="min-w-0">
                        <span class="font-medium block text-white">{{ t('locationDetail.address') }}</span>
                        <span class="text-white/80">{{ formatAddress(popupLocation?.address) }}</span>
                    </div>
                </div>
                <div v-if="availabilityText" class="flex items-center bg-purple-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="timeOutline" class="text-accent-300 mr-2 shrink-0" />
                    <div class="min-w-0">
                        <span class="font-medium block text-white">{{ t('locationDetail.availability') }}</span>
                        <span class="text-white/80 whitespace-pre-line">{{ availabilityText }}</span>
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

            <!-- Bewertungen (Detail) -->
            <div class="mb-4 pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-lg">Bewertungen</h3>
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
                <div v-if="showReviewForm" class="bg-gray-50 p-3 rounded-lg mb-4">
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
                <div v-else-if="reviews.length > 0" class="space-y-4">
                    <div v-for="review in visibleReviews" :key="review.id" class="border-b pb-3 last:border-0 border-gray-100">
                        <div class="flex justify-between items-start mb-1">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0"
                                >
                                    <ion-img
                                        v-if="getReviewUserAvatarUrl(review.user)"
                                        :src="getReviewUserAvatarUrl(review.user)"
                                        class="object-cover w-full h-full"
                                        :alt="review.user?.name"
                                    />
                                    <ion-icon v-else :icon="personCircleOutline" class="text-gray-500" />
                                </div>
                                <div>
                                    <span class="font-medium text-sm">{{ review.user?.name || 'Unbekannt' }}</span>
                                    <span
                                        v-if="review.user?.reputationLevel && review.user.reputationLevel !== 'newcomer'"
                                        class="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                                        :class="{
                                            'bg-green-100 text-green-700': review.user.reputationLevel === 'active',
                                            'bg-purple-100 text-purple-700': review.user.reputationLevel === 'hero',
                                            'bg-yellow-100 text-yellow-700': review.user.reputationLevel === 'legend',
                                        }"
                                    >
                                        {{ reputationLevelLabel(review.user.reputationLevel) }}
                                    </span>
                                </div>
                            </div>
                            <span class="text-xs text-neutral-400">
                                {{ new Date(review.createdAt).toLocaleDateString() }}
                            </span>
                        </div>
                        <div class="flex items-center mb-2 pl-10">
                            <ion-icon
                                v-for="i in 5"
                                :key="i"
                                :icon="star"
                                class="text-xs mr-0.5"
                                :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-200'"
                            />
                        </div>
                        <p v-if="review.comment" class="text-sm text-gray-700 pl-10">{{ review.comment }}</p>
                        <div class="flex items-center gap-3 pl-10 mt-1">
                            <button
                                class="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors"
                                :class="getUserVote(review.id) === 'up'
                                    ? 'bg-green-100 text-green-700'
                                    : 'text-neutral-400 hover:text-success-500 hover:bg-success-50'"
                                :disabled="!isAuthenticated"
                                @click="handleVote(review.id, 'up')"
                            >
                                <ion-icon :icon="thumbsUpOutline" class="text-sm" />
                                <span>{{ getVoteCounts(review.id).upvotes }}</span>
                            </button>
                            <button
                                class="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors"
                                :class="getUserVote(review.id) === 'down'
                                    ? 'bg-red-100 text-red-700'
                                    : 'text-neutral-400 hover:text-error-500 hover:bg-error-50'"
                                :disabled="!isAuthenticated"
                                @click="handleVote(review.id, 'down')"
                            >
                                <ion-icon :icon="thumbsDownOutline" class="text-sm" />
                                <span>{{ getVoteCounts(review.id).downvotes }}</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Load More Button -->
                    <div v-if="hasMoreReviews" class="text-center pt-2">
                        <ion-button fill="clear" size="small" @click="loadMoreReviews">
                            Mehr Bewertungen laden
                        </ion-button>
                    </div>
                </div>
                <p v-else class="text-sm text-neutral-400 italic text-center py-2">Noch keine Bewertungen vorhanden.</p>
            </div>

            <!-- Community-Bestätigung -->
            <div
                v-if="popupLocation?.status === 'pending' || (popupLocation && !popupLocation.verified)"
                class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"
            >
                <div class="flex-1">
                    <p class="text-sm font-medium text-amber-800">Standort bestätigen</p>
                    <p class="text-xs text-amber-600">
                        {{ confirmationCount }} von 3 Bestätigungen
                    </p>
                </div>
                <ion-button
                    v-if="isAuthenticated && !hasUserConfirmed"
                    size="small"
                    fill="outline"
                    color="warning"
                    @click="handleConfirmLocation"
                >
                    <ion-icon :icon="checkmarkCircleOutline" slot="start" />
                    Bestätigen
                </ion-button>
                <ion-chip v-else-if="hasUserConfirmed" color="success" class="text-xs">
                    <ion-icon :icon="checkmarkCircleOutline" />
                    Bestätigt
                </ion-chip>
            </div>

            <!-- Aktionen -->
            <div class="flex justify-between border-t pt-3">
                <ion-button
                    fill="clear"
                    class="flex-1 flex flex-col items-center"
                    :aria-label="isFavorite ? t('favorites.remove') : t('favorites.add')"
                    @click="handleFavoriteClick"
                >
                    <ion-icon :icon="isFavorite ? heart : heartOutline" :color="isFavorite ? 'danger' : undefined" />
                    <span class="text-xs mt-1">{{ isFavorite ? t('favorites.remove') : t('favorites.add') }}</span>
                </ion-button>
                <ion-button fill="clear" class="flex-1 flex flex-col items-center" :aria-label="t('locationDetail.share')" @click="handleShare">
                    <ion-icon :icon="shareOutline" />
                    <span class="text-xs mt-1">{{ t('locationDetail.share') }}</span>
                </ion-button>
                <ion-button
                    fill="solid"
                    color="primary"
                    class="flex-1 flex flex-col items-center"
                    :aria-label="t('locationDetail.route')"
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
    IonChip,
    actionSheetController,
    alertController,
    toastController,
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
    chevronBackOutline,
    chevronForwardOutline,
    ellipsisVertical,
    flagOutline,
    thumbsUpOutline,
    thumbsDownOutline,
} from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useLocationsStore } from '../store/locationsStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useUserStore } from '../store/userStore'
import { useReviewsStore } from '../store/reviewsStore'
import { useReportsStore } from '../store/reportsStore'
import { useReviewVotesStore } from '../store/reviewVotesStore'
import { useConfirmationsStore } from '../store/confirmationsStore'
import useAvatarUrl from '../composables/useAvatarUrl'
import { hapticLight, hapticSuccess } from '../composables/useHaptics'
import CategoryIcon from './CategoryIcon.vue'

const locationsStore = useLocationsStore()
const favoritesStore = useFavoritesStore()
const userStore = useUserStore()
const reviewsStore = useReviewsStore()
const reportsStore = useReportsStore()
const reviewVotesStore = useReviewVotesStore()
const confirmationsStore = useConfirmationsStore()

const { popupLocation } = storeToRefs(locationsStore)
const { t } = useI18n()
const locationModal = ref(null)

// Bild-Snap-Slider
const imageSliderRef = ref(null)
const imageSliderActiveIndex = ref(0)
let imageSliderScrollTimeout = null

function onImageSliderScroll() {
    if (!imageSliderRef.value) return
    if (imageSliderScrollTimeout) clearTimeout(imageSliderScrollTimeout)
    imageSliderScrollTimeout = setTimeout(() => {
        if (!imageSliderRef.value) return
        const slider = imageSliderRef.value
        const { scrollLeft } = slider
        const sliderWidth = slider.clientWidth
        const viewportRight = scrollLeft + sliderWidth
        const children = slider.children
        if (!children.length) return
        let newIndex = 0
        let maxVisibleArea = 0
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            const childLeft = child.offsetLeft
            const childRight = childLeft + child.offsetWidth
            const visibleLeft = Math.max(scrollLeft, childLeft)
            const visibleRight = Math.min(viewportRight, childRight)
            const visibleArea = Math.max(0, visibleRight - visibleLeft)
            const visibilityRatio = visibleArea / child.offsetWidth
            if (visibilityRatio > 0.5 && visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea
                newIndex = i
            } else if (maxVisibleArea === 0 && visibleArea > 0 && visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea
                newIndex = i
            }
        }
        if (newIndex !== imageSliderActiveIndex.value) {
            imageSliderActiveIndex.value = newIndex
        }
    }, 50)
}

function imageSliderScrollToIndex(index) {
    if (!imageSliderRef.value) return
    const slider = imageSliderRef.value
    const children = slider.children
    if (index < 0 || index >= children.length) return
    imageSliderActiveIndex.value = index
    const child = children[index]
    slider.scrollTo({
        left: child.offsetLeft,
        behavior: 'smooth',
    })
}

function imageSliderScrollToPrev() {
    if (imageSliderActiveIndex.value > 0) {
        imageSliderScrollToIndex(imageSliderActiveIndex.value - 1)
    }
}

function imageSliderScrollToNext() {
    const urls = allImageUrls.value
    if (imageSliderActiveIndex.value < urls.length - 1) {
        imageSliderScrollToIndex(imageSliderActiveIndex.value + 1)
    }
}

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
const visibleReviewsCount = ref(3)

const visibleReviews = computed(() => {
    return reviews.value.slice(0, visibleReviewsCount.value)
})

const hasMoreReviews = computed(() => {
    return reviews.value.length > visibleReviewsCount.value
})

function getReviewUserAvatarUrl(reviewUser) {
    return useAvatarUrl(reviewUser?.avatar)
}

function loadMoreReviews() {
    visibleReviewsCount.value += 5
}

// Watch popupLocation to fetch reviews + Slider-Index zurücksetzen
watch(
    () => popupLocation.value?.id,
    async (newId) => {
        imageSliderActiveIndex.value = 0
        if (newId) {
            isReviewsLoading.value = true
            visibleReviewsCount.value = 3
            await reviewsStore.fetchReviews(newId)
            const fetchedReviews = reviewsStore.getReviewsByLocationId(newId)
            for (const r of fetchedReviews) {
                reviewVotesStore.setVoteCountsFromReview(r)
            }
            if (userStore.userId) {
                await reviewVotesStore.fetchUserVotesForLocation(newId, userStore.userId)
                await confirmationsStore.fetchUserConfirmation(newId, userStore.userId)
            }
            await confirmationsStore.fetchConfirmations(newId)
            isReviewsLoading.value = false
            showReviewForm.value = false
            newReviewRating.value = 0
            newReviewComment.value = ''
        }
    }
)

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

const DAY_LABELS_DE = {
    monday: 'Mo',
    tuesday: 'Di',
    wednesday: 'Mi',
    thursday: 'Do',
    friday: 'Fr',
    saturday: 'Sa',
    sunday: 'So',
}

function formatAvailability(oh) {
    if (!oh) return ''
    if (oh.is24_7) return '24/7 geöffnet'
    const schedule = oh.schedule || []
    if (schedule.length === 0) return ''
    return schedule
        .map((s) => {
            const dayDe = (s.day && DAY_LABELS_DE[s.day]) ? DAY_LABELS_DE[s.day] : ''
            const open = s.open || '–'
            const close = s.close || '–'
            return `${dayDe} ${open} - ${close} Uhr`
        })
        .join('\n')
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
    if (!isAuthenticated.value) {
        const toast = await toastController.create({
            message: t('locationDetail.favorite_login_hint'),
            duration: 3000,
            color: 'warning',
        })
        await toast.present()
        return
    }
    const id = popupLocation.value?.id
    if (!id) return

    try {
        if (isFavorite.value && currentFavorite.value) {
            await favoritesStore.removeFavorite(currentFavorite.value.id)
        } else {
            await favoritesStore.addFavorite(id)
        }
        hapticSuccess()
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

async function presentActionSheet() {
    const actionSheet = await actionSheetController.create({
        header: 'Optionen',
        buttons: [
            {
                text: 'Standort melden',
                role: 'destructive',
                icon: flagOutline,
                handler: () => {
                    if (!isAuthenticated.value) {
                        toastController.create({
                            message: 'Bitte melde dich an, um einen Standort zu melden.',
                            duration: 3000,
                            color: 'warning',
                        }).then(t => t.present())
                        return
                    }
                    presentReportAlert()
                },
            },
            {
                text: 'Abbrechen',
                role: 'cancel',
                icon: closeOutline,
            },
        ],
    })
    await actionSheet.present()
}

async function presentReportAlert() {
    const alert = await alertController.create({
        header: 'Standort melden',
        message: 'Warum möchtest du diesen Standort melden?',
        inputs: [
            {
                label: 'Geschlossen / Existiert nicht mehr',
                type: 'radio',
                value: 'not_existing',
            },
            {
                label: 'Falsche Informationen',
                type: 'radio',
                value: 'false_info',
            },
            {
                label: 'Duplikat',
                type: 'radio',
                value: 'spam', // Mapping auf 'spam' da 'duplicate' nicht existiert
            },
            {
                label: 'Unangemessener Inhalt',
                type: 'radio',
                value: 'inappropriate',
            },
            {
                label: 'Sonstiges',
                type: 'radio',
                value: 'other',
            },
        ],
        buttons: [
            {
                text: 'Abbrechen',
                role: 'cancel',
            },
            {
                text: 'Senden',
                handler: async (data) => {
                    if (data) {
                        try {
                            await reportsStore.reportLocation({
                                locationId: popupLocation.value.id,
                                reason: data,
                                userId: userStore.userId,
                            })
                            const toast = await toastController.create({
                                message: 'Vielen Dank! Deine Meldung wurde gesendet.',
                                duration: 2000,
                                color: 'success',
                            })
                            await toast.present()
                        } catch (error) {
                            const toast = await toastController.create({
                                message: 'Fehler beim Senden der Meldung.',
                                duration: 2000,
                                color: 'danger',
                            })
                            await toast.present()
                        }
                    }
                },
            },
        ],
    })
    await alert.present()
}

const REPUTATION_LABELS = {
    newcomer: 'Neuling',
    active: 'Aktiver Teiler',
    hero: 'Community-Held',
    legend: 'Legende',
}

function reputationLevelLabel(level) {
    return REPUTATION_LABELS[level] || ''
}

function getUserVote(reviewId) {
    const vote = reviewVotesStore.getUserVoteForReview(reviewId)
    return vote?.type || null
}

function getVoteCounts(reviewId) {
    return reviewVotesStore.getVoteCounts(reviewId)
}

async function handleVote(reviewId, type) {
    if (!isAuthenticated.value) return
    hapticLight()
    await reviewVotesStore.vote(reviewId, type, userStore.userId)
}

const confirmationCount = computed(() =>
    confirmationsStore.getConfirmationCount(popupLocation.value?.id)
)

const hasUserConfirmed = computed(() =>
    confirmationsStore.hasUserConfirmed(popupLocation.value?.id)
)

async function handleConfirmLocation() {
    if (!isAuthenticated.value || !popupLocation.value?.id) return
    try {
        await confirmationsStore.confirmLocation(
            popupLocation.value.id,
            userStore.userId
        )
        const toast = await toastController.create({
            message: 'Danke für deine Bestätigung!',
            duration: 2000,
            color: 'success',
        })
        await toast.present()
    } catch (e) {
        // apiCall zeigt Toast bei Fehler
    }
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
