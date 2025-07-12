<template>
    <div
        class=" relative w-full h-full transition-opacity" style="width: 100%; height: 100%;"
        :class="{ 'opacity-0': !ready }"
    >
        <div
            class="fixed top-2 left-2 right-2 w-auto z-50 shadow-lg h-18 p-1.5 gap-2
            backdrop-blur-lg bg-light-gray-8 border border-light-gray-16/50
            rounded-2xl"
        >
            top search and filter bar
        </div>

        <div
            class="
            fixed z-50 bottm-32 right-4 w-8 h-8
            rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center
            "
            @click="getGeoLocation"
        >
            <ion-icon aria-hidden="true" size="large" color="light" :icon="navigateCircleOutline" />
        </div>
        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="zoom"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :scrollZoom="true"
            :flyToOptions="{ maxDuration: 500, speed: .5 }"
            @loaded="ready = true"
            @update:center="mapUpdated({ center: $event})"
            @update:zoom="mapUpdated({ zoom: $event})"
        >
            <mapbox-marker
                v-for="location in locations"
                :key="location.id"
                :lngLat="location.coordinates"
                @click="popupLocation = location; center = location.coordinates;"
            >
                <template v-slot:icon>
                    <div
                        class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md"
                        :style="{
                            background: location.category && location.category.color
                                ? `${location.category.color}80` // 50% opacity
                                : 'rgba(99,102,241,0.5)' // fallback: Indigo-500
                        }"
                    >

                        <ion-icon
                            aria-hidden="true"
                            :icon="heartOutline"
                            class="rounded-full p-2 h-4.5 w-4.5 text-light"
                        />
                    </div>
                </template>
            </mapbox-marker>

            <mapbox-marker
                :lngLat="userLocation"
            >
                <template v-slot:icon>
                    <div class=" w-3 h-3 bg-primary-default rounded-full"></div>
                </template>
            </mapbox-marker>

        </mapbox-map>

        <ion-modal
            ref="locationModal"
            :is-open="!!popupLocation"
            :breakpoints="[0, 1]"
            :initial-breakpoint="1"
            @didDismiss="popupLocation = null"
        >
            <div v-if="popupLocation" class="p-4 max-h-[600px] overflow-scroll">
                <h2 class="text-lg font-bold mb-2">{{ popupLocation.name }}</h2>
                <div v-if="popupLocation.image">
                    <img :src="popupLocation.image.url" :alt="popupLocation.title" class="w-full rounded mb-2" />
                </div>
                <div v-if="popupLocation.coordinates" class="mb-2">
                    <strong>Koordinaten:</strong> {{ popupLocation.coordinates }}
                </div>
                <div v-if="popupLocation.address" class="mb-2">
                    <strong>Adresse:</strong><br />
                    {{ popupLocation.address.street }}
                    {{ popupLocation.address.postalCode }}
                    {{ popupLocation.address.city }}
                    {{ popupLocation.address.country }}
                </div>
                <div v-if="popupLocation.category">
                    <strong>Kategorie:</strong> {{ popupLocation.category.name }} {{ popupLocation.category.icon }}
                </div>

                <ion-button expand="block" @click="modelDismiss()" class="mt-4">
                    Schließen
                </ion-button>
            </div>
        </ion-modal>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
// eslint-disable-next-line
import {
    MapboxMap,
    MapboxMarker,
} from 'vue-mapbox-ts';
import { IonButton, IonModal } from '@ionic/vue';
import { navigateCircleOutline, heartOutline } from 'ionicons/icons';

import { useAppStore } from '../store/appStore';

const appStore = useAppStore();
const { geo } = storeToRefs(appStore);

const defaultCenter = [13.354336, 52.477697];
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

const popupLocation = ref(null);
const ready = ref(false);
// const zoom = ref(geo.value?.length ? 12 : 4);
const zoom = ref(10);
const center = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);
const userLocation = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);
const locationModal = ref(null);

const modelDismiss = () => locationModal.value.$el.dismiss();

// Wir setzen ein Timeout, damit das Update erst nach dem Beenden der Bewegung ausgeführt wird
// let mapUpdateTimeout = null;

const mapUpdated = () => {
    // if (mapUpdateTimeout) clearTimeout(mapUpdateTimeout);
    // mapUpdateTimeout = setTimeout(() => {
    //     if (event.center) center.value = event.center;
    //     if (event.zoom) zoom.value = event.zoom;
    // }, 400); // 400ms nach der letzten Bewegung wird aktualisiert
};

const getGeoLocation = async() => {
    await appStore.getGeoLocation();
};

defineProps({
    locations: {
        type: Array,
        required: true
    }
});

watch([center, zoom, userLocation, geo], () => {
    console.log('center: ', center.value);
    console.log('zoom: ', zoom.value);
    console.log('userLocation: ', userLocation.value);
    console.log('geo: ', geo.value);
});

watch(geo, () => {
    if (geo) {
        center.value = [geo.value.long, geo.value.lat];
        userLocation.value = [geo.value.long, geo.value.lat];
    }
});

</script>

<style>
  ion-modal {
    --height: auto;
  }
</style>
