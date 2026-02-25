<template>
    <ion-app role="application" :lang="locale">
        <StyleSwitcher />
        <ion-router-outlet />
        <ConsentBanner v-if="appStore.walkthroughVisited" />
    </ion-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useI18n } from 'vue-i18n';
import { useUserStore } from './store/userStore';
import { useAppStore } from './store/appStore';
import ConsentBanner from './components/ConsentBanner.vue';
import StyleSwitcher from './components/StyleSwitcher.vue';

const { locale } = useI18n();
const userStore = useUserStore();
const appStore = useAppStore();

const isNative = () => {
    return !!(window && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
};

const setStatusBarStyleLight = async() => {
    if (isNative()) {
        try {
            await StatusBar.setOverlaysWebView({ overlay: true });
            await StatusBar.setStyle({ style: Style.Light });
        } catch (e) {
            console.warn('StatusBar Plugin nicht verfügbar:', e);
        }
    }
};

onMounted(async () => {
    setStatusBarStyleLight();
    if (userStore.token && userStore.userId) {
        await userStore.validateAuth();
    }
});
</script>
