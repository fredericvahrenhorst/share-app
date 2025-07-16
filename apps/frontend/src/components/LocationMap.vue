<template>
    <div
        class=" relative w-full h-full transition-opacity" style="width: 100%; height: 100%;"
        :class="{ 'opacity-0': !ready }"
    >
        <!-- Suchfeld in der Top-Bar -->
        <div
            id="search-bar"
            class="fixed top-[calc(var(--ion-statusbar-padding)+2rem)] left-2 right-2 w-auto z-50"
        >
            <ion-item class="flex gap-2 blur-bg-light text-light-gray-96" lines="none" color="transparent">
                <ion-icon :icon="searchOutline" size="small" slot="start" class="text-current mr-2" />
                <ion-input
                    :placeholder="t('search.placeholder')"
                    readonly
                    @click="openSearchModal"
                    class="cursor-pointer border-none"
                    style="--border-width: 0px;"
                />
            </ion-item>
        </div>

        <div
            class="
            fixed z-50 bottom-36 right-4 w-8 h-8
            rounded-full
            flex items-center justify-center
            blur-bg-light text-light-gray-96
            "
            @click="getGeoLocation"
        >
            <ion-icon aria-hidden="true" size="small" color="primary" :icon="navigateOutline" />
        </div>

        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="zoom"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :auto-resize-delay="300"
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
                @click="handleLocationSelect(location)"
            >
                <template v-slot:icon>
                    <div

                        class="
                            rounded-full flex items-center justify-center shadow-lg backdrop-blur-md
                            transition-all duration-300
                        "
                        :class="currentMapData.zoom > 10 ? 'w-9 h-9' : 'w-4 h-4'"
                        :style="{
                            background: location.category && location.category.color
                                ? `${location.category.color}80` // 50% opacity
                                : 'rgba(99,102,241,0.5)' // fallback: Indigo-500
                        }"
                    >

                        <ion-icon
                            v-if="currentMapData.zoom > 10"
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

        <!-- Location Detail Modal -->

        <LocationDetail />

        <!-- Search Modal -->
        <SearchModal
            :is-open="isSearchModalOpen"
            @close="closeSearchModal"
            @select-location="handleLocationSelect"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
// eslint-disable-next-line
import {
    MapboxMap,
    MapboxMarker,
} from 'vue-mapbox-ts';
import { IonItem, IonInput, IonIcon } from '@ionic/vue';
import { navigateOutline, heartOutline, searchOutline } from 'ionicons/icons';
import SearchModal from './SearchModal.vue';
import LocationDetail from './LocationDetail.vue';
import { useAppStore } from '../store/appStore';
import { useLocationsStore } from '../store/locationsStore';

// i18n
const { t } = useI18n();

// Store
const appStore = useAppStore();
const { geo } = storeToRefs(appStore);

const locationsStore = useLocationsStore();

const defaultCenter = [13.354336, 52.477697];
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

const ready = ref(false);
const isSearchModalOpen = ref(false);
const zoom = ref(geo.value ? 10 : 5);
const center = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);
const currentMapData = ref({
    center: center.value,
    zoom: zoom.value
});

const userLocation = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);

// Search Modal Methods
const openSearchModal = () => {
    isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
    isSearchModalOpen.value = false;
};

const handleLocationSelect = (location) => {
    console.log('location: ', location);
    locationsStore.setPopupLocation(location);
    center.value = location.coordinates;
};

const mapUpdated = (event) => {
    const updateZoom = event.zoom || currentMapData.value.zoom;
    const updateCenter = event.center || currentMapData.value.center;
    currentMapData.value = {
        center: updateCenter,
        zoom: updateZoom
    };

    console.log('currentMapData: ', currentMapData.value);
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
  .map-container {
    width: 100%;
    height: 100lvh;
  }
</style>
