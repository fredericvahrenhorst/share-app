<template>
    <ion-modal
        :is-open="isOpen"
        @didDismiss="handleDismiss"
        :initial-breakpoint="1"
        :breakpoints="[0, 0.5, 0.75, 1]"
        class="filter-modal"
    >

        <ion-header collapse="fade" translucent>
            <ion-toolbar>
                <ion-title>
                    {{ t('filter.title') }}
                    <div class="text-sm text-gray-500 mt-1">
                        {{ locationsStore.filteredLocations.length }} {{ t('filter.locations_found') }}
                    </div>
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleDismiss">
                        <ion-icon size="small" color="primary" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Kategorien Sektion -->
            <div class="mb-6">
                <ion-label>
                    {{ t('filter.categories') }}
                </ion-label>
                <div class="space-y-2">
                    <ion-item
                        v-for="category in categories"
                        :key="category.id"
                        @click="toggleCategory(category.id)"
                        :class="[
                            'rounded-lg border cursor-pointer transition-colors',
                            selectedCategories.includes(category.id)
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                        ]"
                        lines="none"
                        button
                    >
                        <ion-icon
                            :icon="getCategoryIcon(category.icon)"
                            slot="start"
                            class="text-xl mr-3"
                            :style="{ color: category.color }"
                        />
                        <ion-label>
                            <h4 class="font-medium text-gray-900">
                                {{ category.name }}
                            </h4>
                            <p class="text-sm text-gray-500 mt-1">
                                {{ category.description }}
                            </p>
                        </ion-label>
                        <ion-checkbox
                            :checked="selectedCategories.includes(category.id)"
                            slot="end"
                            class="ml-2"
                        />
                    </ion-item>
                </div>
            </div>

            <!-- Radius Sektion -->
            <div class="mb-6">
                <ion-label class="text-base font-semibold text-gray-900 mb-3 block">
                    {{ t('filter.radius') }}
                </ion-label>
                <div class="px-4">
                    <ion-range
                        v-model="selectedRadius"
                        :min="0"
                        :max="25"
                        :step="2.5"
                        :snaps="true"
                        class="w-full"
                        @ionChange="onRadiusChange"
                    >
                        <ion-label slot="start" class="text-sm text-gray-600">
                            1 km
                        </ion-label>
                        <ion-label slot="end" class="text-sm text-gray-600">
                            25 km
                        </ion-label>
                    </ion-range>
                    <div class="text-center mt-2">
                        <span class="text-lg font-semibold text-purple-600">
                            {{ selectedRadius === 0 ? t('filter.all_distances') : selectedRadius + ' km' }}
                        </span>
                    </div>
                </div>
            </div>
        </ion-content>

        <ion-footer class="ion-no-border">
            <ion-toolbar class="px-4 py-4">

                <div class="flex flex-col gap-2">

                    <ion-button
                        @click="applyFilters"
                        expand="block"
                        shape="round"
                        size="default"
                    >
                        {{ t('filter.apply') }}
                    </ion-button>

                    <ion-button
                        v-if="hasActiveFilters"
                        @click="clearFilters"
                        fill="outline"
                        shape="round"
                        size="default"
                    >
                        <ion-icon
                            :icon="closeOutline"
                            slot="end"
                            class="ml-2"
                        />
                        {{ t('filter.clear_all') }}
                    </ion-button>

                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonRange,
    IonFooter
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { closeOutline } from 'ionicons/icons';
import { useLocationsStore } from '../store/locationsStore';

// i18n
const { t } = useI18n();

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['close', 'apply-filters']);

// Store
const locationsStore = useLocationsStore();
const { categories } = storeToRefs(locationsStore);

// Local state für Filter-Optionen - initialisiere mit Store-Werten
const selectedCategories = ref([...locationsStore.filterState.categories]);
const selectedRadius = ref(locationsStore.filterState.radius === 'all' ? 0 : locationsStore.filterState.radius);

// Watch for changes in isOpen to sync with store
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        selectedCategories.value = [...locationsStore.filterState.categories];
        selectedRadius.value = locationsStore.filterState.radius === 'all' ? 0 : locationsStore.filterState.radius;
    }
});

// Watch for changes in local filter states and apply filters immediately
watch([selectedCategories, selectedRadius], () => {
    const filterOptions = {
        categories: selectedCategories.value,
        radius: selectedRadius.value,
    };

    // Apply filters immediately without triggering the store watcher
    locationsStore.applyFilters(filterOptions);
}, { deep: true });

// Computed properties
const hasActiveFilters = computed(() => selectedCategories.value.length > 0 || selectedRadius.value > 0);

// Methods
const handleDismiss = () => {
    emit('close');
};

const toggleCategory = (categoryId) => {
    const index = selectedCategories.value.indexOf(categoryId);
    if (index > -1) {
        selectedCategories.value.splice(index, 1);
    } else {
        selectedCategories.value.push(categoryId);
    }
};

const onRadiusChange = (event) => {
    selectedRadius.value = event.detail.value;
};

const applyFilters = () => {
    // Save current filters to localStorage and close modal
    const filterOptions = {
        categories: selectedCategories.value,
        radius: selectedRadius.value,
    };

    locationsStore.applyFilters(filterOptions);
    emit('close');
};

const clearFilters = () => {
    // Clear local state
    selectedCategories.value = [];
    selectedRadius.value = 0;

    // Clear filters in store
    locationsStore.clearFilters();
};

const getCategoryIcon = (iconName) => iconName || 'location-outline';
</script>

<style scoped>
.filter-modal {
    --height: 80%;
}
</style>
