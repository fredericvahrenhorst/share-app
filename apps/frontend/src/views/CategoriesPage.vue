<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Kategorien</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Kategorien</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="p-4 pb-28">
                <div v-if="isLoading" class="text-center py-16 text-primary-400">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p class="mt-4">{{ t('misc.is_loading') }}</p>
                </div>

                <div v-else-if="categories.length === 0" class="text-center py-16 text-primary-400">
                    <ion-icon :icon="gridOutline" size="large" class="text-6xl mb-4"></ion-icon>
                    <p class="text-xl font-display font-extrabold mb-2">{{ t('categories.empty_title') }}</p>
                    <p class="text-sm text-primary-400">Kategorien werden geladen, sobald Standorte verfügbar sind.</p>
                </div>

                <div v-else class="grid grid-cols-2 gap-4 mb-6">
                    <div
                        v-for="category in categories"
                        :key="category.id"
                        class="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        @click="selectCategory(category)"
                    >
                        <div
                            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                            :style="{ background: category.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
                        >
                            <ion-icon :icon="getCategoryIcon(category.icon)" class="text-2xl text-white"></ion-icon>
                        </div>
                        <h3 class="text-base font-display font-extrabold text-primary-600 mb-2">{{ category.name }}</h3>
                        <p class="text-xs text-primary-400 leading-relaxed">{{ category.description }}</p>
                    </div>
                </div>

                <ion-button
                    v-if="categories.length > 0"
                    expand="block"
                    class="mt-4 rounded-xl py-4"
                    :style="{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
                    @click="showAllCategories"
                >
                    Alle Kategorien anzeigen
                </ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
} from '@ionic/vue';
import {
    gridOutline,
    bookOutline,
    constructOutline,
    leafOutline,
    settingsOutline,
    restaurantOutline,
    shirtOutline,
    carOutline,
    bulbOutline,
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocationsStore } from '../store/locationsStore';

const { t } = useI18n();
const router = useRouter();
const locationsStore = useLocationsStore();

// Computed properties für reaktive Daten
const categories = computed(() => locationsStore.categories);
const isLoading = computed(() => locationsStore.isLoading);

// Icon mapping für Kategorien
const iconMap = {
    'book-outline': bookOutline,
    'construct-outline': constructOutline,
    'leaf-outline': leafOutline,
    'settings-outline': settingsOutline,
    'restaurant-outline': restaurantOutline,
    'shirt-outline': shirtOutline,
    'car-outline': carOutline,
    'bulb-outline': bulbOutline,
};

function getCategoryIcon(iconName) {
    return iconMap[iconName] || gridOutline;
}

function selectCategory(category) {
    locationsStore.applyFilters({ categories: [category.id] });
    router.push('/home');
}

function showAllCategories() {
    locationsStore.clearFilters();
    router.push('/home');
}

onMounted(async() => {
    // Kategorien von API (sortOrder, isActive); bei Bedarf zuerst Locations für Fallback
    if (locationsStore.categories.length === 0) {
        await locationsStore.fetchCategories();
    }
    // Zuerst ggf. Locations laden (Fallback für Kategorien), dann Kategorien von API
    if (locationsStore.locations.length === 0) {
        await locationsStore.getAllLocations();
    }
});
</script>
