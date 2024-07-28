<template>
    <ion-header :translucent="true" ref="header">
        <ion-toolbar
            class="ion-no-padding"
        >
            <div slot="start" class="flex gap-4 items-center px-4 pt-4">
                APP LOGO
                <h1 class="m-0 font-bold text-xl">{{ title }}</h1>
            </div>

            <ion-buttons class="pt-4 px-4" slot="primary">
                <ion-button
                    :id="`${path}-menu`" color="dark" size="small" aria-label="Menu">
                    <ion-icon slot="icon-only" :icon="ellipsisHorizontal"></ion-icon>
                </ion-button>
                <ion-popover :trigger="`${path}-menu`" size="auto" :dismiss-on-select="true">
                    <ion-content>
                        <ion-list class="ion-padding-none">
                            <ion-item :button="true" @click="openSettingsModal" expand="block">
                                <ion-label class="ion-padding-start">
                                    <span class="text-2xs">{{ $t('menu.settings') }}</span>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </ion-content>
                </ion-popover>
            </ion-buttons>
        </ion-toolbar>
        <ion-progress-bar
            v-show="loading"
            class="transition-opacity"
            type="indeterminate"
        />
    </ion-header>
</template>

<script setup>
import {
    IonHeader,
    IonToolbar,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    IonProgressBar,
    modalController,
} from '@ionic/vue';
import { ellipsisHorizontal } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import SettingsModal from './SettingsModal.vue';

defineProps({
    title: {
        type: String,
        required: true,
    },
    search: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const route = useRoute();

// remove first character from route path
const path = route.path.slice(1);

const openSettingsModal = async() => {
    const settingsModal = await modalController.create({
        component: SettingsModal,
    });

    settingsModal.present();
};

// const createToast = async(options) => {
//     const toast = await toastController.create({
//         position: options.position,
//         duration: options.duration,
//         color: options.color,
//         icon: options.icon,
//         message: options.message,
//         swipeGesture: 'vertical',
//     });

//     await toast.present();
// };

</script>

<style scoped>
    ion-item {
        --padding-start: 0;
    }
</style>
