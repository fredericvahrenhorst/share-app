<template>

    <ion-page ref="page">
        <page-header :title="$t( 'pages.start.title' )" :loading="loading" />
        <ion-content :fullscreen="true">

            <ion-text>
                <h1>Empty Page</h1>

                <p>
                    This is an example of an empty page.
                </p>

                <button @click="callToaster">Toaser Here</button>
            </ion-text>

        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import {
    IonContent,
    IonPage,
    IonText,
    toastController,
} from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';

import pageHeader from '../components/PageHeader.vue';

const loading = ref(false);

const callToaster = async() => {
    console.log('Toaster here');
    const toast = await toastController.create({
        position: 'top',
        color: 'danger',
        duration: 3000,
        icon: closeCircleOutline,
        message: 'TOASET TEST 5000',
        swipeGesture: 'vertical',
    });

    await toast.present();
};

</script>
