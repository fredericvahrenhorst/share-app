<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/home" />
                </ion-buttons>
                <ion-title>{{ t('addResource.title') }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="flex items-center px-4 py-2 bg-primary-50 rounded-lg mb-4">
                <div v-for="step in 3" :key="step" class="flex items-center flex-1">
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        :class="step <= currentStep ? 'bg-accent-300 text-primary-600' : 'bg-primary-200 text-primary-400'"
                    >
                        {{ step }}
                    </div>
                    <div
                        v-if="step < 3"
                        class="flex-1 h-0.5 mx-2"
                        :class="step < currentStep ? 'bg-accent-300' : 'bg-primary-200'"
                    />
                </div>
            </div>
            <!-- Step 1: Standort -->
            <div v-if="currentStep === 1" class="h-full flex flex-col">
                <div class="text-center mb-4">
                    <h2 class="text-lg font-semibold">{{ t('addResource.step1.title') }}</h2>
                    <p class="text-sm text-primary-400">{{ t('addResource.step1.searchPlaceholder') }}</p>
                </div>

                <div class="flex-grow relative rounded-xl overflow-hidden border border-primary-200 mb-4 min-h-[300px]">
                    <MapboxMap
                        v-if="mapboxToken"
                        :accessToken="mapboxToken"
                        :center="mapCenter"
                        :zoom="mapZoom"
                        class="w-full h-full"
                        @click="handleMapClick"
                    >
                        <MapboxMarker
                            v-if="selectedCoordinates"
                            :lngLat="selectedCoordinates"
                            color="#EF4444"
                        />
                        <MapboxMarker
                            v-if="userLocation"
                            :lngLat="userLocation"
                            color="#3B82F6"
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

                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div
                        v-for="category in categories"
                        :key="category.id"
                        class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-32"
                        :class="selectedCategoryId === category.id ? 'border-blue-500 bg-blue-50' : 'border-primary-200 hover:border-primary-300'"
                        @click="selectCategory(category.id)"
                    >
                        <div class="text-3xl mb-2">{{ category.icon || '📦' }}</div>
                        <div class="font-medium text-sm">{{ category.name }}</div>
                    </div>
                </div>

                <div class="mt-auto">
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

                <div class="space-y-4 mb-6">
                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label position="stacked">{{ t('addResource.step3.name') }} *</ion-label>
                        <ion-input v-model="formData.name" :placeholder="t('addResource.step3.namePlaceholder')" required />
                    </ion-item>

                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label position="stacked">{{ t('addResource.step3.description') }} *</ion-label>
                        <ion-textarea v-model="formData.description" :placeholder="t('addResource.step3.descriptionPlaceholder')" rows="4" required />
                    </ion-item>

                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label position="stacked">{{ t('addResource.step3.rules') }}</ion-label>
                        <ion-textarea v-model="formData.rules" :placeholder="t('addResource.step3.rulesPlaceholder')" rows="2" />
                    </ion-item>

                    <ion-item class="rounded-lg border border-primary-200" lines="none">
                        <ion-label>{{ t('addResource.step3.is24_7') }}</ion-label>
                        <ion-toggle v-model="formData.is24_7" slot="end" />
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
                </div>

                <div class="mt-auto">
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
        <SuccessAnimation
            :is-visible="showSuccessAnimation"
            :message="t('addResource.success.title')"
            @complete="onSuccessAnimationComplete"
        />
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
    IonLabel,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSpinner,
    toastController
} from '@ionic/vue';
import {
    locateOutline,
    cameraOutline,
    trashOutline,
    checkmarkCircleOutline,
    closeCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { MapboxMap, MapboxMarker } from 'vue-mapbox-ts';
import { storeToRefs } from 'pinia';

import { useLocationsStore } from '../store/locationsStore';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import apiCall from '../composables/apiCall';
import SuccessAnimation from '../components/SuccessAnimation.vue';

const { t } = useI18n();
const router = useRouter();
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
const showSuccessAnimation = ref(false);

// Step 1: Location
const mapCenter = ref(defaultCenter);
const mapZoom = ref(11);
const selectedCoordinates = ref(null);
const selectedAddress = ref(null);
const userLocation = computed(() => (geo.value ? [geo.value.long, geo.value.lat] : null));

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

// Methods
onMounted(() => {
    if (userLocation.value) {
        mapCenter.value = userLocation.value;
    }
    // Lade Kategorien falls noch nicht vorhanden
    if (categories.value.length === 0) {
        locationsStore.fetchCategories();
    }
});

function handleMapClick(event) {
    const { lng, lat } = event.lngLat;
    selectedCoordinates.value = [lng, lat];
    // Optional: Reverse Geocoding hier einbauen
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

function onSuccessAnimationComplete() {
    showSuccessAnimation.value = false
    router.replace('/home')
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

            // Spezieller API Call für Multipart
            // Hinweis: apiCall muss FormData unterstützen oder wir nutzen axios direkt
            // Hier nutzen wir apiCall und passen es gleich an (siehe Todo 4)
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
            }, // Einfaches Lexical Format
            category: selectedCategoryId.value,
            coordinates: selectedCoordinates.value, // [lng, lat]
            address: selectedAddress.value || {},
            openingHours: {
                is24_7: formData.value.is24_7,
                schedule: [] // Leer lassen für MVP
            },
            rules: formData.value.rules,
            status: 'pending', // Muss erst freigeschaltet werden
            images: mediaId ? [{ image: mediaId }] : []
        };

        await apiCall('locations', {
            method: 'POST',
            data: locationPayload
        });

        // Success - show animation first
        showSuccessAnimation.value = true;
        locationsStore.getAllLocations();
    } catch (error) {
        console.error('Error creating location:', error);
        // apiCall zeigt bereits Fehler-Toast
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
/* Mapbox Container Styling */
:deep(.mapboxgl-map) {
    border-radius: 0.75rem;
}
</style>
