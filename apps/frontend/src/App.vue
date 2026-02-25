<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useUserStore } from './store/userStore';

const userStore = useUserStore();

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
