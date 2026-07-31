<template>
    <ion-modal
        :is-open="isOpen"
        @didDismiss="handleDismiss"
        :initial-breakpoint="1"
        :breakpoints="[0, 0.5, 0.75, 1]"
        class="filter-modal"
    >

        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <span class="inline-flex items-baseline gap-2 flex-wrap">
                        <span>{{ t('filter.title') }}</span>
                        <span class="text-sm font-normal text-white/75">
                            {{ locationsStore.filteredLocations.length }} {{ t('filter.locations_found') }}
                        </span>
                    </span>
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="handleDismiss" :aria-label="t('misc.close')">
                        <ion-icon :icon="closeOutline" class="w-5 h-5" />
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
                                ? 'bg-accent-50 border-accent-300'
                                : 'bg-white border-primary-200 hover:border-primary-300'
                        ]"
                        lines="none"
                        button
                    >
                        <div slot="start" class="mr-3" :style="{ color: category.color || '#275243' }">
                            <CategoryIcon
                                :icon="category.icon"
                                size-class="w-6 h-6 text-xl"
                            />
                        </div>
                        <ion-label>
                            <h4 class="font-medium text-primary-600">
                                {{ category.name }}
                            </h4>
                            <p class="text-sm text-primary-400 mt-1">
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

            <!-- Öffnungszeiten Sektion -->
            <div class="mb-6">
                <ion-label class="text-base font-semibold text-gray-900 mb-3 block">
                    {{ t('filter.availability') }}
                </ion-label>
                <div class="space-y-2">
                    <ion-item
                        v-for="opt in availabilityOptions"
                        :key="opt.value"
                        @click="selectedAvailability = opt.value"
                        :class="[
                            'rounded-lg border cursor-pointer transition-colors',
                            selectedAvailability === opt.value
                                ? 'bg-secondary-50 border-secondary-300'
                                : 'bg-white border-primary-200 hover:border-primary-300'
                        ]"
                        lines="none"
                        button
                    >
                        <ion-icon :icon="opt.icon" slot="start" class="w-5 h-5 mr-3 text-secondary-600" />
                        <ion-label>{{ opt.label }}</ion-label>
                        <ion-radio
                            :value="opt.value"
                            :checked="selectedAvailability === opt.value"
                            slot="end"
                        />
                    </ion-item>
                </div>
            </div>

            <!-- Barrierefreiheit Sektion -->
            <div class="mb-6">
                <ion-label class="text-base font-semibold text-gray-900 mb-3 block">
                    {{ t('filter.accessibility') }}
                </ion-label>
                <div class="space-y-2">
                    <ion-item
                        class="rounded-lg border bg-white border-gray-200"
                        lines="none"
                    >
                        <ion-icon :icon="accessibilityOutline" slot="start" class="w-5 h-5 mr-3 text-secondary-600" />
                        <ion-label>{{ t('filter.wheelchair') }}</ion-label>
                        <ion-checkbox
                            :checked="accessibilityFilters.wheelchair"
                            @ionChange="accessibilityFilters.wheelchair = $event.detail.checked"
                            slot="end"
                        />
                    </ion-item>
                    <ion-item
                        class="rounded-lg border bg-white border-gray-200"
                        lines="none"
                    >
                        <ion-icon :icon="maleFemaleOutline" slot="start" class="w-5 h-5 mr-3 text-secondary-600" />
                        <ion-label>{{ t('filter.accessible_toilet') }}</ion-label>
                        <ion-checkbox
                            :checked="accessibilityFilters.toilet"
                            @ionChange="accessibilityFilters.toilet = $event.detail.checked"
                            slot="end"
                        />
                    </ion-item>
                    <ion-item
                        class="rounded-lg border bg-white border-gray-200"
                        lines="none"
                    >
                        <ion-icon :icon="carOutline" slot="start" class="w-5 h-5 mr-3 text-secondary-600" />
                        <ion-label>{{ t('filter.accessible_parking') }}</ion-label>
                        <ion-checkbox
                            :checked="accessibilityFilters.parking"
                            @ionChange="accessibilityFilters.parking = $event.detail.checked"
                            slot="end"
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
                        <span class="text-lg font-semibold text-secondary-600">
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
    IonFooter,
    IonRadio,
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import {
    closeOutline,
    timeOutline,
    ellipseOutline,
    alarmOutline,
    accessibilityOutline,
    maleFemaleOutline,
    carOutline,
} from 'ionicons/icons';
import { useLocationsStore } from '../store/locationsStore';
import CategoryIcon from './CategoryIcon.vue';

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
const selectedAvailability = ref(locationsStore.filterState.availability || 'all');
const accessibilityFilters = ref({
    wheelchair: locationsStore.filterState.accessibility?.wheelchair || false,
    toilet: locationsStore.filterState.accessibility?.toilet || false,
    parking: locationsStore.filterState.accessibility?.parking || false,
});

const availabilityOptions = computed(() => [
    { value: 'all', label: t('filter.all'), icon: timeOutline },
    { value: 'open_now', label: t('filter.open_now'), icon: ellipseOutline },
    { value: '24_7', label: t('filter.24_7'), icon: alarmOutline },
]);

// Watch for changes in isOpen to sync with store
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        selectedCategories.value = [...locationsStore.filterState.categories];
        selectedRadius.value = locationsStore.filterState.radius === 'all' ? 0 : locationsStore.filterState.radius;
        selectedAvailability.value = locationsStore.filterState.availability || 'all';
        accessibilityFilters.value = {
            wheelchair: locationsStore.filterState.accessibility?.wheelchair || false,
            toilet: locationsStore.filterState.accessibility?.toilet || false,
            parking: locationsStore.filterState.accessibility?.parking || false,
        };
    }
});

// Watch for changes in local filter states and apply filters immediately
watch([selectedCategories, selectedRadius, selectedAvailability, accessibilityFilters], () => {
    const filterOptions = {
        categories: selectedCategories.value,
        radius: selectedRadius.value,
        availability: selectedAvailability.value,
        accessibility: { ...accessibilityFilters.value },
    };

    locationsStore.applyFilters(filterOptions);
}, { deep: true });

// Computed properties
const hasActiveFilters = computed(() =>
    selectedCategories.value.length > 0
    || selectedRadius.value > 0
    || selectedAvailability.value !== 'all'
    || accessibilityFilters.value.wheelchair
    || accessibilityFilters.value.toilet
    || accessibilityFilters.value.parking
);

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
    selectedCategories.value = [];
    selectedRadius.value = 0;
    selectedAvailability.value = 'all';
    accessibilityFilters.value = { wheelchair: false, toilet: false, parking: false };

    locationsStore.clearFilters();
};

</script>

<style scoped>
.filter-modal {
    --height: 80%;
}
</style>
