<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar
                slot="bottom"
                class="fixed bottom-0 left-0 right-0 w-auto z-50 h-18 p-1.5 pb-6 gap-2 !rounded-none"
            >
                <ion-tab-button
                    v-for="tab in tabs"
                    :key="tab.tab"
                    :tab="tab.tab"
                    :href="tab.href"
                    class="flex flex-col items-center p-1 rounded-lg transition-all duration-200"
                >
                    <ion-icon
                        aria-hidden="true"
                        :icon="tab.icon"
                        class="transition-colors duration-200 h-5 w-5 mb-0.5"
                    />
                    <ion-label>{{ tab.label }}</ion-label>
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
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

const tabs = computed(() => [
    {
        tab: 'home',
        href: '/home',
        icon: mapOutline,
        label: t('tabs.map'),
    },
    {
        tab: 'kategorien',
        href: '/kategorien',
        icon: gridOutline,
        label: t('tabs.categories'),
    },
    {
        tab: 'favoriten',
        href: '/favoriten',
        icon: heartOutline,
        label: t('tabs.favorites'),
    },
    {
        tab: 'profil',
        href: '/profil',
        icon: personOutline,
        label: t('tabs.profile'),
    },
]);
</script>

<style scoped>
ion-tab-button {
    @apply flex-1;
}
</style>
