<template>
    <ion-card
        class="blur-bg-light text-white"
        @click="handleClick"
        :aria-label="location.name"
    >
        <ion-card-content>
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <ion-card-title class="text-lg font-semibold">
                        {{ location.name }}
                    </ion-card-title>
                    <ion-card-subtitle v-if="location.category" class="flex items-center mt-1">
                        <div
                            class="w-3 h-3 rounded-full mr-2"
                            :style="{ backgroundColor: location.category.color || '#6366F1' }"
                        ></div>
                        {{ location.category.name }}
                    </ion-card-subtitle>
                </div>
                <!-- Distanz-Anzeige -->
                <div
                    v-if="location.distance"
                    class="text-xs text-light-gray-96 bg-blue-100 px-2 py-1 rounded-full"
                >
                    {{ formatDistance(location.distance) }}
                </div>
            </div>

            <!-- Adresse -->
            <div v-if="location.address" class="mb-2 text-sm text-gray-600">
                <ion-icon :icon="locationOutline" class="mr-1" />
                {{ formatAddress(location.address) }}
            </div>

            <!-- Beschreibung -->
            <div v-if="location.description" class="text-sm text-gray-700 line-clamp-2">
                {{ stripHtml(location.description) }}
            </div>
        </ion-card-content>
    </ion-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonIcon } from '@ionic/vue';
import { locationOutline } from 'ionicons/icons';

const props = defineProps({
    location: { type: Object, required: true },
    categoryObj: { type: Object, default: null },
});

const emit = defineEmits(['select']);
const { t } = useI18n();

function formatDistance(distance) {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)} m`;
    return `${(distance / 1000).toFixed(1)} km`;
}

const stripHtml = (html) => {
    if (!html) return '';
    // Einfache HTML-Strip-Funktion
    return `${html.replace(/<[^>]*>/g, '').substring(0, 150)}...`;
};

const formatAddress = (address) => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`);
    } else if (address.city) {
        parts.push(address.city);
    }
    return parts.join(', ');
};

function handleClick() {
    emit('select', props.location);
}
</script>
