<template>
    <ion-modal
        ref="modal"
        :is-open="isOpen"
        @didDismiss="handleDismiss"
        class="add-location-modal"
    >
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ t('addResource.title') }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeModal">
                        <ion-icon :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <ion-segment :value="currentStep.toString()">
                    <ion-segment-button value="1" disabled>
                        <ion-label>{{ t('addResource.steps.location') }}</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="2" disabled>
                        <ion-label>{{ t('addResource.steps.category') }}</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="3" disabled>
                        <ion-label>{{ t('addResource.steps.details') }}</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Step 1: Standort -->
            <div v-if="currentStep === 1" class="h-full flex flex-col">
                <div class="text-center mb-4">
                    <h2 class="text-lg font-semibold">{{ t('addResource.step1.title') }}</h2>
                    <p class="text-sm text-primary-400">
                        Verschiebe den Pin oder klicke auf die Karte, um den Standort festzulegen.
                    </p>
                </div>

                <div class="flex-grow relative rounded-xl overflow-hidden border border-primary-200 mb-4 min-h-[300px]">
                    <MapboxMap
                        v-if="mapboxToken"
                        :accessToken="mapboxToken"
                        :center="mapCenter"
                        :zoom="mapZoom"
                        class="w-full h-full"
                        @click="handleMapClick"
                        @loaded="onMapLoaded"
                    >
                        <MapboxMarker
                            v-if="selectedCoordinates"
                            :lngLat="selectedCoordinates"
                            color="#EF4444"
                            draggable
                            @dragend="handleMarkerDragEnd"
                        />
                    </MapboxMap>
                </div>

                <ion-button expand="block" fill="outline" class="mb-4" @click="useCurrentLocation">
                    <ion-icon slot="start" :icon="locateOutline" />
                    {{ t('addResource.step1.useCurrentLocation') }}
                </ion-button>

                <div v-if="selectedAddress" class="mb-4 p-3 bg-primary-50 rounded-lg text-sm">
                    <p class="font-semibold">Ausgewählter Standort:</p>
                    <p>{{ formatAddress(selectedAddress) }}</p>
                </div>

                <ion-button expand="block" :disabled="!selectedCoordinates" @click="nextStep">
                    {{ t('common.next') }}
                </ion-button>
            </div>

            <!-- Step 2: Kategorie -->
            <div v-else-if="currentStep === 2" class="h-full flex flex-col">
                <div class="text-center mb-4">
                    <h2 class="text-lg font-semibold">{{ t('addResource.step2.title') }}</h2>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4 overflow-y-auto">
                    <div
                        v-for="category in categories"
                        :key="category.id"
                        class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-32"
                        :class="selectedCategoryId === category.id ? 'border-blue-500 bg-blue-50' : 'border-primary-200 hover:border-primary-300'"
                        @click="selectCategory(category.id)"
                    >
                        <!-- Icon Rendering: Falls Icon ein String (Emoji) ist -->
                        <div class="text-3xl mb-2">{{ category.icon || '📦' }}</div>
                        <div class="font-medium text-sm">{{ category.name }}</div>
                    </div>
                </div>

                <div class="mt-auto pt-4">
                    <div class="flex gap-2">
                        <ion-button expand="block" fill="outline" class="flex-1" @click="prevStep">
                            {{ t('common.back') }}
                        </ion-button>
                        <ion-button expand="block" class="flex-1" :disabled="!selectedCategoryId" @click="nextStep">
                            {{ t('common.next') }}
                        </ion-button>
                    </div>
                </div>
            </div>

            <!-- Step 3: Details -->
            <div v-else-if="currentStep === 3" class="h-full flex flex-col">
                <div class="text-center mb-4">
                    <h2 class="text-lg font-semibold">{{ t('addResource.step3.title') }}</h2>
                </div>

                <div class="space-y-4 mb-6 overflow-y-auto">
                    <!-- Pflichtfelder -->
                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label position="stacked">{{ t('addResource.step3.name') }} *</ion-label>
                        <ion-input v-model="formData.name" :placeholder="t('addResource.step3.namePlaceholder')" required />
                    </ion-item>

                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label position="stacked">{{ t('addResource.step3.description') }} *</ion-label>
                        <ion-textarea v-model="formData.description" :placeholder="t('addResource.step3.descriptionPlaceholder')" rows="4" required />
                    </ion-item>

                    <!-- Bild Upload -->
                    <div class="border-2 border-dashed border-primary-300 rounded-lg p-4 text-center">
                        <div v-if="imagePreview" class="relative mb-2">
                            <img :src="imagePreview" class="max-h-48 mx-auto rounded-lg" />
                            <ion-button
                                fill="clear"
                                color="danger"
                                class="absolute top-0 right-0"
                                @click="removeImage"
                            >
                                <ion-icon :icon="trashOutline" />
                            </ion-button>
                        </div>
                        <div v-else>
                            <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                ref="fileInput"
                                @change="handleFileChange"
                            />
                            <ion-button fill="outline" size="small" @click="$refs.fileInput.click()">
                                <ion-icon slot="start" :icon="cameraOutline" />
                                Bild hinzufügen
                            </ion-button>
                        </div>
                    </div>

                    <!-- Weitere Infos Toggle -->
                    <div class="pt-2">
                        <ion-button fill="clear" expand="block" @click="showMoreDetails = !showMoreDetails">
                            {{ showMoreDetails ? 'Weniger Optionen' : 'Weitere Optionen anzeigen' }}
                            <ion-icon slot="end" :icon="showMoreDetails ? chevronUpOutline : chevronDownOutline" />
                        </ion-button>
                    </div>

                    <div v-if="showMoreDetails" class="space-y-4 animate-fade-in">
                        <ion-item class="rounded-lg border border-primary-200" lines="none">
                            <ion-label position="stacked">{{ t('addResource.step3.rules') }}</ion-label>
                            <ion-textarea v-model="formData.rules" :placeholder="t('addResource.step3.rulesPlaceholder')" rows="2" />
                        </ion-item>

                        <ion-item class="rounded-lg border border-primary-200" lines="none">
                            <ion-label>{{ t('addResource.step3.is24_7') }}</ion-label>
                            <ion-toggle v-model="formData.is24_7" slot="end" />
                        </ion-item>
                    </div>
                </div>

                <div class="mt-auto pt-4">
                    <div class="flex gap-2">
                        <ion-button expand="block" fill="outline" class="flex-1" @click="prevStep" :disabled="isSubmitting">
                            {{ t('common.back') }}
                        </ion-button>
                        <ion-button expand="block" class="flex-1" @click="submitLocation" :disabled="!isValidStep3 || isSubmitting">
                            <ion-spinner v-if="isSubmitting" name="crescent" class="mr-2" />
                            {{ t('addResource.submit') }}
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSpinner,
    toastController
} from '@ionic/vue';
import {
    closeOutline,
    locateOutline,
    cameraOutline,
    trashOutline,
    checkmarkCircleOutline,
    chevronDownOutline,
    chevronUpOutline
} from 'ionicons/icons';
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MapboxMap, MapboxMarker } from 'vue-mapbox-ts';
import { storeToRefs } from 'pinia';

import { useLocationsStore } from '../store/locationsStore';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import apiCall from '../composables/apiCall';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'location-added']);

const { t } = useI18n();
const locationsStore = useLocationsStore();
const appStore = useAppStore();
const userStore = useUserStore();

const { categories } = storeToRefs(locationsStore);
const { geo } = storeToRefs(appStore);

// Mapbox Config
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
const defaultCenter = [13.354336, 52.477697];

// State
const currentStep = ref(1);
const isSubmitting = ref(false);
const showMoreDetails = ref(false);

// Step 1: Location
const mapCenter = ref(defaultCenter);
const mapZoom = ref(13);
const selectedCoordinates = ref(null);
const selectedAddress = ref(null);
const userLocation = computed(() => (geo.value ? [geo.value.long, geo.value.lat] : null));
const mapInstance = ref(null);

// Step 2: Category
const selectedCategoryId = ref(null);

// Step 3: Details
const formData = ref({
    name: '',
    description: '',
    rules: '',
    is24_7: false
});
const selectedFile = ref(null);
const imagePreview = ref(null);

// Computed
const isValidStep3 = computed(() => {
    return formData.value.name.trim() && formData.value.description.trim();
});

// Watchers
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        resetForm();
        if (userLocation.value) {
            mapCenter.value = userLocation.value;
            // Setze Pin initial auf User Position wenn noch keiner gesetzt
            if (!selectedCoordinates.value) {
                selectedCoordinates.value = userLocation.value;
                selectedAddress.value = { street: 'Aktueller Standort', city: '' };
            }
        }
        // Lade Kategorien falls noch nicht vorhanden
        if (categories.value.length === 0) {
            locationsStore.fetchCategories();
        }
    }
});

function onMapLoaded(map) {
    mapInstance.value = map;
    map.resize(); // Wichtig für Modal-Rendering
}

function handleMapClick(event) {
    const { lng, lat } = event.lngLat;
    updateSelectedLocation(lng, lat);
}

function handleMarkerDragEnd(event) {
    const { lng, lat } = event.target.getLngLat();
    updateSelectedLocation(lng, lat);
}

function updateSelectedLocation(lng, lat) {
    selectedCoordinates.value = [lng, lat];
    // Simuliertes Reverse Geocoding
    selectedAddress.value = {
        street: 'Gewählte Position',
        city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
}

function useCurrentLocation() {
    if (userLocation.value) {
        selectedCoordinates.value = userLocation.value;
        mapCenter.value = userLocation.value;
        mapZoom.value = 14;
        selectedAddress.value = { street: 'Aktueller Standort', city: '' };
    }
}

function formatAddress(addr) {
    if (!addr) return '';
    return [addr.street, addr.postalCode, addr.city].filter(Boolean).join(', ');
}

function selectCategory(id) {
    selectedCategoryId.value = id;
}

function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    selectedFile.value = null;
    imagePreview.value = null;
}

function nextStep() {
    if (currentStep.value < 3) currentStep.value++;
}

function prevStep() {
    if (currentStep.value > 1) currentStep.value--;
}

function resetForm() {
    currentStep.value = 1;
    selectedCoordinates.value = null;
    selectedAddress.value = null;
    selectedCategoryId.value = null;
    formData.value = {
        name: '',
        description: '',
        rules: '',
        is24_7: false
    };
    selectedFile.value = null;
    imagePreview.value = null;
    showMoreDetails.value = false;
}

function closeModal() {
    emit('close');
}

function handleDismiss() {
    emit('close');
}

async function submitLocation() {
    if (!isValidStep3.value) return;
    isSubmitting.value = true;

    try {
        let mediaId = null;

        // 1. Bild hochladen (falls vorhanden)
        if (selectedFile.value) {
            const uploadData = new FormData();
            uploadData.append('file', selectedFile.value);
            uploadData.append('_payload', JSON.stringify({ alt: formData.value.name }));

            const mediaResponse = await apiCall('media', {
                method: 'POST',
                data: uploadData,
            });
            mediaId = mediaResponse.doc.id;
        }

        // 2. Location erstellen
        const locationPayload = {
            name: formData.value.name,
            description: {
                root: {
                    type: 'root',
                    children: [
                        {
                            type: 'paragraph',
                            children: [{ type: 'text', text: formData.value.description, version: 1 }],
                            version: 1
                        }
                    ],
                    direction: null,
                    format: '',
                    indent: 0,
                    version: 1
                }
            },
            category: selectedCategoryId.value,
            coordinates: selectedCoordinates.value, // [lng, lat]
            address: selectedAddress.value || {},
            openingHours: {
                is24_7: formData.value.is24_7,
                schedule: []
            },
            rules: formData.value.rules,
            status: 'pending',
            images: mediaId ? [{ image: mediaId }] : []
        };

        await apiCall('locations', {
            method: 'POST',
            data: locationPayload
        });

        // Success
        const toast = await toastController.create({
            message: t('addResource.success.message'),
            duration: 3000,
            color: 'success',
            icon: checkmarkCircleOutline,
            position: 'top'
        });
        await toast.present();

        locationsStore.getAllLocations(); // Neu laden
        emit('location-added');
        closeModal();

    } catch (error) {
        console.error('Error creating location:', error);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
