<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';

// StatusBar nur auf unterstützten Plattformen verwenden
const isNative = () => {
    return !!(window && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
};

const setStatusBarStyleLight = async() => {
    if (isNative()) {
        try {
            await StatusBar.setOverlaysWebView({ overlay: true });
            await StatusBar.setStyle({ style: Style.Light });
        } catch (e) {
            // Fehler ignorieren, falls Plugin nicht verfügbar ist
            // Optional: console.warn('StatusBar Plugin nicht verfügbar:', e);
            console.warn('StatusBar Plugin nicht verfügbar:', e);
        }
    }
};

onMounted(() => {
    setStatusBarStyleLight();
});
</script>
