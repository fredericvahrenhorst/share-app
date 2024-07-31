<template>
    <div
        class=" w-full h-full transition-opacity" style="width: 100%; height: 100%;"
        :class="{ 'opacity-0': !ready }"
    >
        center: {{ center }}
        zoom: {{ Math.round(zoom) }}
        userLocation: {{ userLocation }}
        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="zoom"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :scrollZoom="false"
            :flyToOptions="{ maxDuration: 500, speed: .5 }"
            @loaded="ready = true"
            @update:center="mapUpdated({ center: $event})"
            @update:zoom="mapUpdated({ zoom: $event})"
        >
            <mapbox-marker
                v-for="pin in pins"
                :key="pin.id"
                :lngLat="pin.location"
                @click="popupPin = pin"
            >
                <template v-slot:icon>
                    <div>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- eslint-disable -->
                            <path d="M30.4826 12.4826C30.4826 15.2982 28.5078 19.9386 24.6131 26.2738C21.7652 30.9065 18.8766 34.8153 18.8477 34.8547L17.9999 36L17.1522 34.8547C17.1233 34.8153 14.2347 30.9065 11.3868 26.2738C7.49213 19.9386 5.51733 15.2982 5.51733 12.4826C5.51726 5.60004 11.1167 0 17.9999 0C24.8832 0 30.4826 5.60004 30.4826 12.4826Z" fill="#CD0000"/>
                            <path d="M25.138 12.2891C25.138 16.2253 21.9362 19.4277 18 19.4277C14.0637 19.4277 10.8621 16.2253 10.8621 12.2891C10.8621 8.35358 14.0638 5.15112 18 5.15112C21.9361 5.15112 25.138 8.35358 25.138 12.2891Z" fill="white"/>
                            <!-- eslint-enable -->
                        </svg>
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

            <mapbox-popup
                v-if="popupPin"
                :lngLat="popupPin.location"
                :closeButton="true"
                :offset="[0, -42]"
            >
                <div>
                    <h3>{{ popupPin.title }}</h3>
                    <p>{{ popupPin.description }}</p>
                </div>
            </mapbox-popup>
        </mapbox-map>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
// eslint-disable-next-line
import {
    MapboxMap,
    MapboxMarker,
    MapboxPopup,
} from 'vue-mapbox-ts';

import { useAppStore } from '../store/appStore';

const appStore = useAppStore();
const { geo } = storeToRefs(appStore);

const defaultCenter = [10.485843, 51.330290];
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

const popupPin = ref(null);
const ready = ref(false);
// const zoom = ref(geo.value?.length ? 12 : 4);
const zoom = ref(12);
const center = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);
const userLocation = ref([geo.value?.long || defaultCenter[0], geo.value?.lat || defaultCenter[1]]);

const mapUpdated = (event) => {
    if (event.center) center.value = event.center;
    if (event.zoom) zoom.value = event.zoom;
};

defineProps({
    pins: {
        type: Array,
        required: true,
    },
});

watch(geo, () => {
    if (geo) {
        center.value = [geo.value.long, geo.value.lat];
        userLocation.value = [geo.value.long, geo.value.lat];
    }
});

</script>
