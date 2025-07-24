<template>
    <ion-page ref="page">
        <ion-content :fullscreen="true">
            <!-- Loading Overlay -->
            <div
                v-show="isLoading"
                class="
                    fixed top-0 left-0 w-full h-full z-50
                    flex items-center justify-center
                ">
                <div class="w-auto h-auto p-6 blur-bg flex items-center justify-center gap-2">
                    <ion-spinner name="crescent" />
                    <span class="text-sm text-light-gray-96">{{ t('misc.is_loading') }}</span>
                </div>
            </div>
            <location-map :locations="filteredLocationsByRadius" :all-locations="locations" />
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonPage,
    IonSpinner,
} from '@ionic/vue';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { distance } from "@turf/distance";
import { point } from '@turf/helpers';

import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/appStore';
import { useLocationsStore } from '../store/locationsStore';

// import PageHeader from '../../components/PageHeader.vue';
import LocationMap from '../components/LocationMap.vue';

// i18n
const { t } = useI18n();

const userStore = useUserStore();
const appStore = useAppStore();
const locationsStore = useLocationsStore();

const { authenticated } = storeToRefs(userStore);
const { isLoading } = storeToRefs(locationsStore);

const locations = ref([]);
// Berechnet eine gefilterte Liste von Standorten, die im Umkreis des Nutzers liegen.
// Die Filterung basiert auf dem aktuellen Standort (appStore.geo) und dem eingestellten Radius (appStore.radius).
const filteredLocationsByRadius = computed(() => {
    if (!locations.value || !appStore.mapGeo) return [];

    const userPoint = point([appStore.mapGeo.long, appStore.mapGeo.lat]);

    // Filtere alle Standorte, die Koordinaten haben und innerhalb des Radius liegen
    return locations.value.filter((loc) => {
        // Standort muss gültige Koordinaten (Array mit 2 Werten) haben
        if (!loc.coordinates || loc.coordinates.length !== 2) return false;

        // Erstelle einen GeoJSON-Punkt für den Standort
        const locPoint = point([loc.coordinates[0], loc.coordinates[1]]);

        // Berechne die Distanz zwischen Nutzer und Standort in Kilometern
        const dist = distance(userPoint, locPoint, { units: 'kilometers' });

        // Nur Standorte innerhalb des eingestellten Radius zurückgeben
        return dist <= appStore.radius;
    });
});

onMounted(async() => {
    console.log('authenticated.value: ', authenticated.value);
    if (!appStore.geo || (appStore.geo.ts + 900000) - Date.now() < 0) {
        try {
            await appStore.getGeoLocation();
        } catch (error) {
            console.error(error);
        }
    }

    await getStartPageData();
});

const getStartPageData = async() => {
    await Promise.all([
        locationsStore.getAllLocations(),
    ]).then((values) => {
        locations.value = values[0]?.docs;
    });
};
</script>
