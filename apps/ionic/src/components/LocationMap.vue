<template>
    <div
        v-if="pins"
        class=" w-full h-full" style="width: 100%; height: 100%;"
    >
        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="12"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :scrollZoom="false"
            :flyToOptions="{ maxDuration: 2000, speed: 1.2 }"
        >
            <mapbox-marker
                v-for="pin in pins"
                :key="pin.id" :lngLat="pin.location"
                @click="popupPin = pin"
                class="asdasda"
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

            <mapbox-navigation-control position="bottom-right" />
        </mapbox-map>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
// eslint-disable-next-line
import {
    MapboxMap,
    MapboxMarker,
    MapboxPopup,
    MapboxNavigationControl
} from 'vue-mapbox-ts';

import { useAppStore } from '../store/appStore';

const appStore = useAppStore();
const { geo } = storeToRefs(appStore);

const popupPin = ref(null);
const ready = ref(false);

const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
const center = [geo.value?.long || 0, geo.value?.lat || 0];

defineProps({
    pins: {
        type: Array,
        required: true,
    },
});

onMounted(() => {
    console.log('mounted Map');
    ready.value = true;
    setTimeout(() => {
        ready.value = true;
    }, 1000);
});
</script>
