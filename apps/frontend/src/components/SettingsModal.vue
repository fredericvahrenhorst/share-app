<template>
    <ion-header collapse="fade">
        <ion-toolbar>
            <ion-title>{{ $t('settings.title') }}</ion-title>
            <ion-buttons slot="start">
                <ion-button @click="cancel">
                    {{ $t('misc.close') }}
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-list>
            <ion-item>
                <ion-toggle :checked="themeToggle" @ionChange="toggleChange($event)">
                    <ion-label>
                        <h3 class="!text-base">
                            {{ $t('settings.dark_mode') }}
                        </h3>
                    </ion-label>
                </ion-toggle>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h3 class="!text-base">{{ $t('settings.language') }}</h3>
                </ion-label>
                <ion-select
                    :value="currentLocale"
                    interface="popover"
                    @ionChange="changeLanguage($event)"
                >
                    <ion-select-option value="de">Deutsch</ion-select-option>
                    <ion-select-option value="en">English</ion-select-option>
                </ion-select>
            </ion-item>
        </ion-list>

        <div class="ion-padding text-xs text-medium-shade">
            <ion-text>
                <a @click="goToLegal('imprint')">
                    {{ $t('settings.imprint') }}
                </a> |
                <a @click="goToLegal('privacy')">
                    {{ $t('settings.data_protection') }}
                </a>
            </ion-text>
        </div>

    </ion-content>
</template>

<script setup>
import {
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonTitle,
    IonToggle,
    IonButtons,
    IonButton,
    IonText,
    IonSelect,
    IonSelectOption,
    modalController,
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia'; // eslint-disable-line
import { Browser } from '@capacitor/browser'; // eslint-disable-line
import { useAppStore } from '../store/appStore';

import { useRouter } from 'vue-router';

const router = useRouter();
const cancel = () => modalController.dismiss();

const goToLegal = async (type) => {
    await modalController.dismiss();
    router.push({ name: 'Legal', query: { type } });
};

const { locale } = useI18n()
const appStore = useAppStore();
const { theme } = storeToRefs(appStore);
const themeToggle = ref(false);
const currentLocale = ref(locale.value);

const changeLanguage = (event) => {
    const lang = event.detail.value
    locale.value = lang
    currentLocale.value = lang
    localStorage.setItem('appLanguage', lang)
};

const toggleTheme = (isDark) => {
    if (isDark === true) {
        appStore.setTheme('dark');
    } else {
        appStore.setTheme('light');
    }
};

const openLink = async(url) => {
    await Browser.open({ url });
};

onMounted(async() => {
    if ((theme.value !== null && theme.value === 'dark') || localStorage.getItem('theme') === 'dark') {
        themeToggle.value = true;
    } else {
        themeToggle.value = false;
    }
});

const toggleChange = (ev) => {
    toggleTheme(ev.detail.checked);
};
</script>
