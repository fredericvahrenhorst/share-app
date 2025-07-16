<template>
    <ion-modal
        ref="locationModal"
        :is-open="!!popupLocation"
        :initial-breakpoint="0.5"
        :breakpoints="[0, 0.5, 0.75, 1]"
        @didDismiss="popupLocation = null"
        class="popupLocation"
    >
        <ion-header collapse="fade" translucent>
            <ion-toolbar>
                <div v-if="popupLocation.category" class="flex items-center mb-2">
                    <ion-icon :icon="categoryIcon" class="text-xl mr-2" />
                    <span class="text-sm text-gray-500">{{ popupLocation.category?.name }}</span>
                </div>
                <ion-title>{{ popupLocation.name }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleDismiss">
                        <ion-icon size="small" color="primary" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Kopfbereich -->
            <div class="flex items-center mb-2">
                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">Eingeschränkt</span>
                <span class="flex items-center text-sm text-gray-600">
                    <ion-icon :icon="starIcon" class="text-yellow-400 mr-1" />
                    4.9 <span class="mx-1 text-gray-400">(67 Bewertungen)</span>
                </span>
            </div>

            <!-- Bildbereich -->
            <div class="rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center h-40">
                <img
                    v-if="popupLocation.image"
                    :src="popupLocation.image.url"
                    :alt="popupLocation.title"
                    class="object-cover w-full h-full"
                />
                <ion-icon v-else :icon="categoryIcon" class="text-5xl text-indigo-400" />
            </div>

            <!-- Beschreibung -->
            <div class="mb-4">
                <h3 class="font-semibold mb-1">Beschreibung</h3>
                <p class="text-gray-700">{{ popupLocation.description }}</p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.

            </div>

            <!-- Info-Karten -->
            <div class="space-y-2 mb-4">
                <div class="flex items-center bg-blue-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="locationOutline" class="text-blue-400 mr-2" />
                    <span class="font-medium">Adresse</span>
                    <span class="ml-2 text-gray-700">{{ formatAddress(popupLocation.address) }}</span>
                </div>
                <div class="flex items-center bg-purple-50 rounded-lg px-3 py-2">
                    <ion-icon :icon="timeOutline" class="text-purple-400 mr-2" />
                    <span class="font-medium">Verfügbarkeit</span>
                    <span class="ml-2 text-gray-700">{{ popupLocation.availability }}</span>
                </div>
            </div>

            <!-- Kontakt -->
            <div class="mb-4">
                <h3 class="font-semibold mb-1">Kontakt</h3>
                <div class="flex flex-col gap-1">
                    <a
                        v-if="popupLocation.email"
                        :href="`mailto:${popupLocation.email}`"
                        class="flex items-center text-blue-600 hover:underline"
                    >
                        <ion-icon :icon="mailOutline" class="mr-2" />{{ popupLocation.email }}
                    </a>
                    <a
                        v-if="popupLocation.website"
                        :href="popupLocation.website"
                        target="_blank"
                        class="flex items-center text-blue-600 hover:underline"
                    >
                        <ion-icon :icon="globeOutline" class="mr-2" />Website besuchen
                    </a>
                </div>
            </div>

            <!-- Aktionen -->
            <div class="flex justify-between border-t pt-3">
                <ion-button fill="clear" class="flex-1 flex flex-col items-center">
                    <ion-icon :icon="heartOutline" />
                    <span class="text-xs mt-1">Merken</span>
                </ion-button>
                <ion-button fill="clear" class="flex-1 flex flex-col items-center">
                    <ion-icon :icon="shareOutline" />
                    <span class="text-xs mt-1">Teilen</span>
                </ion-button>
                <ion-button
                    fill="solid"
                    color="primary"
                    class="flex-1 flex flex-col items-center"
                >
                    <ion-icon :icon="navigateOutline" />
                    <span class="text-xs mt-1">Route</span>
                </ion-button>
            </div>

        </ion-content>
    </ion-modal>
</template>

<script setup>
import { IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonModal } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import {
    locationOutline,
    timeOutline,
    mailOutline,
    globeOutline,
    heartOutline,
    shareOutline,
    navigateOutline,
    star as starIcon,
    closeOutline,
} from 'ionicons/icons';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocationsStore } from '../store/locationsStore'; // <--- Store importieren

const locationsStore = useLocationsStore();
const { popupLocation } = storeToRefs(locationsStore); // <--- popupLocation als Ref

const { t } = useI18n();

const locationModal = ref(null);

// Dummy: Icon für Kategorie, kann ggf. aus location.category.icon kommen
const categoryIcon = computed(
    () => popupLocation.value?.category?.icon || locationOutline
);

function formatAddress(address) {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`);
    } else if (address.city) {
        parts.push(address.city);
    }
    if (address.country) parts.push(address.country);
    return parts.join(', ');
}

// Popup schließen
function handleDismiss() {
    locationModal.value.$el.dismiss();
}
</script>
