<template>
    <ion-page ref="page">
        <!-- <page-header :title="$t( 'pages.start.title' )" :loading="loading" /> -->
        <ion-content :fullscreen="true">

            <div
                class="absolute z-50 top-4 right-4 flex justify-center items-center p-1 bg-light-default rounded-md"
                @click="getGeoLocation"
            >
                <ion-icon aria-hidden="true" size="large" color="primary" :icon="navigateCircleOutline" />
            </div>
            <location-map :pins="pins" />

        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonPage,
    IonIcon,
} from '@ionic/vue';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import { onMounted, ref } from 'vue';
import { navigateCircleOutline } from 'ionicons/icons';

import { Geolocation } from '@capacitor/geolocation'; // eslint-disable-line
import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/appStore';
import { useLocationsStore } from '../store/locationsStore';

// import PageHeader from '../../components/PageHeader.vue';
import LocationMap from '../components/LocationMap.vue';

const userStore = useUserStore();
const appStore = useAppStore();
const locationsStore = useLocationsStore();

const { authenticated } = storeToRefs(userStore);

const loading = ref(true);
const pins = ref([]);

onMounted(async() => {
    console.log('authenticated.value: ', authenticated.value);
    loading.value = true;

    if (!appStore.geo || (appStore.geo.ts + 900000) - Date.now() < 0) {
        try {
            await getGeoLocation();
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
        pins.value = values[0]?.docs;

        loading.value = false;
    });
};

const getGeoLocation = async() => {
    const geoData = await Geolocation.getCurrentPosition();
    appStore.setGeoLatLong(geoData);
};

</script>
