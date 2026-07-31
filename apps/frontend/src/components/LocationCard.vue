<template>
    <ion-card
        class="bg-white border border-neutral-200 shadow-sm text-primary-600"
        @click="handleClick"
        :aria-label="location.name"
        button
    >
        <ion-card-content>
            <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                    <ion-card-title class="text-lg font-semibold text-primary-600">
                        {{ location.name }}
                    </ion-card-title>
                    <ion-card-subtitle v-if="location.category" class="flex items-center mt-1 text-primary-400">
                        <div
                            class="w-3 h-3 rounded-full mr-2 shrink-0"
                            :style="{ backgroundColor: location.category.color || '#275243' }"
                        ></div>
                        {{ location.category.name }}
                    </ion-card-subtitle>
                </div>
                <div
                    v-if="location.distance"
                    class="text-xs bg-accent-300 text-primary-600 px-2 py-1 rounded shrink-0"
                >
                    {{ formatDistance(location.distance) }}
                </div>
            </div>

            <div v-if="location.address" class="mb-2 mt-2 text-sm text-primary-400 flex items-start">
                <ion-icon :icon="locationOutline" class="mr-1 mt-0.5 shrink-0 w-4 h-4" aria-hidden="true" />
                <span>{{ formatAddress(location.address) }}</span>
            </div>

            <div v-if="location.description" class="text-sm text-primary-400 line-clamp-2">
                {{ stripHtml(location.description) }}
            </div>
        </ion-card-content>
    </ion-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonIcon } from '@ionic/vue'
import { locationOutline } from 'ionicons/icons'

defineProps({
    location: { type: Object, required: true },
    categoryObj: { type: Object, default: null },
})

const emit = defineEmits(['select'])
useI18n()

function formatDistance(distance) {
    if (!distance) return ''
    if (distance < 1000) return `${Math.round(distance)} m`
    return `${(distance / 1000).toFixed(1)} km`
}

const stripHtml = (html) => {
    if (!html) return ''
    if (typeof html === 'object') return ''
    return `${String(html).replace(/<[^>]*>/g, '').substring(0, 150)}...`
}

const formatAddress = (address) => {
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`)
    } else if (address.city) {
        parts.push(address.city)
    }
    return parts.join(', ')
}

function handleClick() {
    emit('select')
}
</script>
