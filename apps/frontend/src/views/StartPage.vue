<template>
    <ion-page ref="page">
        <!-- <page-header :title="$t( 'pages.start.title' )" :loading="loading" /> -->
        <ion-content :fullscreen="true">
            <location-map :locations="locations" />
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonPage,
} from '@ionic/vue';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import { onMounted, ref } from 'vue';

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
const locations = ref([]);

onMounted(async() => {
    console.log('authenticated.value: ', authenticated.value);
    loading.value = true;

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

        loading.value = false;
    });
};
</script>
