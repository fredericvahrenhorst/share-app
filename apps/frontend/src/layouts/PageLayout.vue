<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar
                slot="bottom"
                class="fixed bottom-2 left-2 right-2 w-auto z-50 shadow-lg h-18 p-1.5 gap-2
                backdrop-blur-lg bg-light-gray-8 border border-light-gray-16/50
                rounded-2xl"
            >
                <ion-tab-button
                    v-for="tab in tabs"
                    :key="tab.tab"
                    :tab="tab.tab"
                    :href="tab.href"
                    class="flex flex-col items-center p-1 rounded-2xl transition-all duration-300"
                    :class="{
                        'from-purple-100 to-blue-100 bg-gradient-to-br': $route.path === tab.href,
                        'bg-gray-100': $route.path !== tab.href
                    }"
                >
                    <ion-icon
                        aria-hidden="true"
                        :icon="tab.icon"
                        class="transition-colors duration-200 rounded-full p-2 h-4.5 w-4.5 mb-1"
                        :class="{
                            'bg-gradient-to-br from-purple-500 to-blue-600 text-white ': $route.path === tab.href,
                            'bg-gray-100 text-gray-500 hover:bg-gray-200': $route.path !== tab.href
                        }"
                    />
                    <ion-label class="text-xs font-medium">{{ tab.label }}</ion-label>
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
import {
    mapOutline,
    gridOutline,
    heartOutline,
    personOutline,
} from 'ionicons/icons';

const tabs = [
    {
        tab: 'home',
        href: '/home',
        icon: mapOutline,
        label: 'Karte'
    },
    {
        tab: 'kategorien',
        href: '/kategorien',
        icon: gridOutline,
        label: 'Kategorien'
    },
    {
        tab: 'favoriten',
        href: '/favoriten',
        icon: heartOutline,
        label: 'Favoriten'
    },
    {
        tab: 'profil',
        href: '/profil',
        icon: personOutline,
        label: 'Profil'
    }
];
</script>

<style scoped>
ion-tab-button {
    @apply flex-1;
}
</style>
