<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="tab1" href="/home">
                    <ion-icon aria-hidden="true" :icon="homeOutline" />
                    <ion-label>Start</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab2" href="/page2">
                    <ion-icon aria-hidden="true" size="medium" :icon="calendarOutline" />
                    <ion-label>page2</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab3" href="/page3">
                    <ion-icon aria-hidden="true" :icon="bookmarkOutline" />
                    <ion-label>page3</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup>
import {
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonLabel,
    IonIcon,
    IonPage,
    IonRouterOutlet,
} from '@ionic/vue';
import { calendarOutline, homeOutline, bookmarkOutline } from 'ionicons/icons';
</script>

<style scoped>
    ion-icon {
        @apply text-[1.35rem] leading-7;
    }
</style>
