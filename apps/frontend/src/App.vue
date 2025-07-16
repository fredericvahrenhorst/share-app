<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';

// Display content under transparent status bar
StatusBar.setOverlaysWebView({ overlay: true });

const setStatusBarStyleLight = async() => {
    await StatusBar.setStyle({ style: Style.Light });
};
onMounted(() => {
    setStatusBarStyleLight();
});
</script>
