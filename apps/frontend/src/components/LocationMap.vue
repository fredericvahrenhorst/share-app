<template>
    <div
        class="relative w-full h-full transition-opacity"
        style="width: 100%; height: 100%"
        :class="{ 'opacity-0': !ready }"
    >
        <!-- Suchfeld in der Top-Bar -->
        <div
            id="search-bar"
            class="fixed top-[calc(var(--ion-statusbar-padding)+2rem)] left-2 right-2 w-auto z-50"
        >
            <ion-item
                class="flex gap-2 blur-bg-light text-light-gray-96"
                lines="none"
                color="transparent"
            >
                <ion-icon
                    :icon="searchOutline"
                    size="small"
                    slot="start"
                    class="text-current mr-2"
                />
                <ion-input
                    :placeholder="t('search.placeholder')"
                    readonly
                    @click="openSearchModal"
                    class="cursor-pointer border-none"
                    style="--border-width: 0px"
                />
            </ion-item>
        </div>

        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="zoom"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :auto-resize-delay="300"
            :scrollZoom="true"
            :flyToOptions="{ maxDuration: 500, speed: 0.5 }"
            @loaded="onMapLoaded"
            @update:center="mapUpdated({ center: $event })"
            @update:zoom="mapUpdated({ zoom: $event })"
        >
            <!-- Location Markers -->
            <mapbox-marker
                v-for="location in locations"
                :key="`marker-${location.id}`"
                :lngLat="location.coordinates"
                @click="handleLocationSelect(location)"
            >
                <template v-slot:icon>
                    <div
                        class="rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300"
                        :class="
                            currentMapData.zoom > 10 ? 'w-9 h-9' : 'w-4 h-4'
                        "
                        :style="{
                            background:
                                location.category && location.category.color
                                    ? `${location.category.color}80` // 50% opacity
                                    : 'rgba(99,102,241,0.5)', // fallback: Indigo-500
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

            <!-- User Location Marker -->
            <mapbox-marker :lngLat="userLocation">
                <template v-slot:icon>
                    <div
                        class="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-lg"
                    ></div>
                </template>
            </mapbox-marker>

            <!-- Radius Circle -->
            <mapbox-geogeometry-circle
                v-if="userLocation && radius && currentMapData.zoom < 12"
                :center="userLocation"
                :radius="radius"
                fillColor="#2b7fff"
                outlineColor="#155dfc"
                :opacity="0.15"
                :edges="64"
            />
        </mapbox-map>

        <!-- Button Bar -->
        <div class="fixed z-50 bottom-28 left-2 right-2 flex items-center justify-between">
            <!-- Radius Info -->
            <div
                v-if="geo"
                class="px-3 py-1 rounded-full blur-bg-light text-xs text-gray-600"
            >
                {{ radius }}{{ t('radius.unit') }} {{ t('radius.label') }}
            </div>

            <div
                class="w-10 h-10 rounded-full flex items-center justify-center blur-bg-light text-blue-500"
                @click="getGeoLocation(true)"
            >
                <ion-icon
                    aria-hidden="true"
                    size="small"
                    color="current"
                    :icon="navigate"
                />
            </div>
        </div>

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
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { MapboxMap, MapboxMarker, MapboxGeogeometryCircle } from 'vue-mapbox-ts';
import { IonItem, IonInput, IonIcon } from '@ionic/vue';
import { navigate, heartOutline, searchOutline } from 'ionicons/icons';
import SearchModal from './SearchModal.vue';
import LocationDetail from './LocationDetail.vue';
import { useAppStore } from '../store/appStore';
import { useLocationsStore } from '../store/locationsStore';

// i18n
const { t } = useI18n();

// Store
const appStore = useAppStore();
const { geo, radius } = storeToRefs(appStore);

const locationsStore = useLocationsStore();

const defaultCenter = [13.354336, 52.477697];
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

const ready = ref(false);
const isSearchModalOpen = ref(false);
const zoom = ref(geo.value ? (radius.value > 10 ? 9 : 11) : 5);
const center = ref([
    geo.value?.long || defaultCenter[0],
    geo.value?.lat || defaultCenter[1],
]);
const currentMapData = ref({
    center: center.value,
    zoom: zoom.value,
});

const userLocation = ref([
    geo.value?.long || defaultCenter[0],
    geo.value?.lat || defaultCenter[1],
]);

const props = defineProps({
    locations: {
        type: Array,
        required: true,
    },
});

// Map instance reference for radius circle
const mapInstance = ref(null);

// Search Modal Methods
const openSearchModal = () => {
    isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
    isSearchModalOpen.value = false;
};

const handleLocationSelect = (location) => {
    console.log('location: ', location);
    if (!location.isExternal) {
        locationsStore.setPopupLocation(location);
    }

    center.value = location.coordinates;
};

// Setup radius circle when map is loaded
const onMapLoaded = () => {
    ready.value = true;
};

const mapUpdated = (event) => {
    const updateZoom = event.zoom || currentMapData.value.zoom;
    const updateCenter = event.center || currentMapData.value.center;
    currentMapData.value = {
        center: updateCenter,
        zoom: updateZoom,
    };

    console.log('currentMapData: ', currentMapData.value);
};

const getGeoLocation = async(force = false) => {
    await appStore.getGeoLocation(force);
};

watch([center, zoom, userLocation, geo], () => {
    console.log('center: ', center.value);
    console.log('zoom: ', zoom.value);
    console.log('userLocation: ', userLocation.value);
    console.log('geo: ', geo.value);
});

watch(geo, () => {
    if (geo.value) {
        center.value = [geo.value.long, geo.value.lat];
        userLocation.value = [geo.value.long, geo.value.lat];
        // updateRadiusCircle();
    }
});
</script>

<style>
.map-container {
    width: 100%;
    height: 100lvh !important;
}
</style>
