<template>
    <ion-page ref="page">
        <page-header :title="$t( 'pages.start.title' )" :loading="loading" />
        <ion-content :fullscreen="true">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

            <div class="my-4">
                <ion-text>
                    <h2 class="ion-padding m-0 text-base font-semibold">{{ $t( 'pages.start.welcome' ) }}</h2>
                </ion-text>

                <div class="container">
                    {{ pins }}
                    {{ geo }}

                    <button @click="getGeoLocation">GET GEO</button>
                </div>

                <ion-text>
                    <p class="ion-padding">
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                        tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
                        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren
                        , no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
                        amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                        labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
                        sanctus est Lorem ipsum dolor sit amet.
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                        tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
                        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren
                        , no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
                        amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                        labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
                        sanctus est Lorem ipsum dolor sit amet.
                    </p>
                </ion-text>
            </div>

        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonText,
} from '@ionic/vue';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import { onMounted, ref } from 'vue';
import { Geolocation } from '@capacitor/geolocation'; // eslint-disable-line
import { useUserStore } from '../../store/userStore';
import { useAppStore } from '../../store/appStore';
import { useLocationsStore } from '../../store/locationsStore';

import PageHeader from '../../components/PageHeader.vue';

const userStore = useUserStore();
const appStore = useAppStore();
const locationsStore = useLocationsStore();

const { authenticated } = storeToRefs(userStore);
const { geo } = storeToRefs(appStore);

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

const handleRefresh = async(event) => {
    // Refresh Hander here

    event.target.complete();
};

const getStartPageData = async() => {
    await Promise.all([
        locationsStore.getAllLocations(),
    ]).then((values) => {
        pins.value = values[0]?.data;

        loading.value = false;
    });
};

const getGeoLocation = async() => {
    const geoData = await Geolocation.getCurrentPosition();
    appStore.setGeoLatLong(geoData);
};

</script>
