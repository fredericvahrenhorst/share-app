<template>
    <ion-modal
        :is-open="isOpen"
        @didDismiss="handleDismiss"
        :initial-breakpoint="0.5" :breakpoints="[0, 0.5, 0.75, 1]"
    >

        <ion-header collapse="fade" translucent>
            <ion-toolbar>
                <ion-title>{{ t('search.title') }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleDismiss">
                        <ion-icon size="small" color="primary" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Suchfeld -->
            <div class="mb-4">
                <ion-item class="blur-bg" lines="none">
                    <ion-icon :icon="searchOutline" size="small" slot="start" class="text-current mr-2" />
                    <ion-input
                        ref="searchInput"
                        v-model="searchQuery"
                        :placeholder="t('search.placeholder')"
                        @ionInput="handleSearchInput"
                        @keydown.enter="handleEnterKey"
                        clear-input
                    />
                </ion-item>
            </div>

            <!-- Kategorie-Filter -->
            <div class="mb-4">
                <div class="relative">
                    <!-- Dropdown Trigger -->
                    <button
                        @click="toggleCategoryDropdown"
                        class="!bg-white blur-bg flex items-center justify-between w-full px-4.5 py-2.5"
                    >
                        <span class="flex items-center">
                            <div
                                v-if="selectedCategory !== 'all' && selectedCategoryObj"
                                class="w-3 h-3 rounded-full mr-2"
                                :style="{ backgroundColor: selectedCategoryObj.color || '#6366F1' }"
                            ></div>
                            {{ selectedCategory === 'all' ? t('search.all_categories')
                                : (selectedCategoryObj ? selectedCategoryObj.name : t('search.all_categories')) }}
                        </span>
                        <ion-icon
                            :icon="chevronDownOutline"
                            class="ml-2 h-4 w-4 text-gray-400"
                            :class="{ 'transform rotate-180': isCategoryDropdownOpen }"
                        />
                    </button>

                    <!-- Dropdown Menu -->
                    <div
                        v-if="isCategoryDropdownOpen"
                        class="absolute z-50 w-full mt-1 max-h-48 overflow-auto blur-bg-light"
                    >
                        <!-- Alle Kategorien Option -->
                        <button
                            @click="selectCategory('all')"
                            class="
                                flex items-center w-full px-3 py-2 text-left
                                hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                            "
                        >
                            <div class="flex items-center">
                                {{ t('search.all_categories') }}
                            </div>
                        </button>

                        <!-- Kategorie Optionen -->
                        <button
                            v-for="category in categories"
                            :key="category.id"
                            @click="selectCategory(category.id)"
                            class="
                                flex items-center w-full px-3 py-2 text-left
                                hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                            "
                        >
                            <div class="flex items-center">
                                <div
                                    class="w-3 h-3 rounded-full mr-2"
                                    :style="{ backgroundColor: category.color || '#6366F1' }"
                                ></div>
                                {{ category.name }}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isSearching" class="flex justify-center py-8">
                <ion-spinner name="crescent" />
                <span class="ml-2 text-gray-600">{{ t('search.loading') }}</span>
            </div>

            <!-- Suchergebnisse -->
            <div v-else-if="hasSearchResults" class="space-y-3">
                <div class="text-sm text-gray-600 mb-4">
                    {{ searchPagination.totalDocs }}
                    {{ searchPagination.totalDocs !== 1 ? t('search.results_found_plural')
                        : t('search.results_found') }}
                </div>

                <LocationCard
                    v-for="location in searchResults"
                    :key="location.id"
                    :location="location"
                    :category-obj="location.category"
                    @select="selectLocation"
                />

                <!-- Pagination -->
                <div v-if="searchPagination.totalPages > 1" class="flex justify-center mt-6">
                    <ion-button
                        :disabled="!searchPagination.hasPrevPage"
                        @click="loadPrevPage"
                        fill="clear"
                    >
                        <ion-icon :icon="chevronBackOutline" slot="start" />
                        {{ t('search.pagination.back') }}
                    </ion-button>

                    <span class="flex items-center px-4 text-sm text-gray-600">
                        {{ t('search.pagination.page') }}{{ searchPagination.page }} {{ t('search.pagination.of') }} {{ searchPagination.totalPages }}
                    </span>

                    <ion-button
                        :disabled="!searchPagination.hasNextPage"
                        @click="loadNextPage"
                        fill="clear"
                    >
                        {{ t('search.pagination.next') }}
                        <ion-icon :icon="chevronForwardOutline" slot="end" />
                    </ion-button>
                </div>
            </div>

            <!-- Keine Ergebnisse -->
            <div v-else-if="!searchQueryEmpty && !isSearching" class="text-center py-12">
                <ion-icon :icon="searchOutline" class="text-6xl text-gray-300 mb-4" />
                <h3 class="text-lg font-medium text-gray-600 mb-2">{{ t('search.no_results_title') }}</h3>
                <p class="text-sm text-gray-500">
                    {{ t('search.no_results_description') }}
                </p>
            </div>

            <!-- Start-Zustand -->
            <div v-else class="text-center py-12">
                <ion-icon :icon="searchOutline" class="text-6xl text-gray-300 mb-4" />
                <h3 class="text-lg font-medium text-gray-600 mb-2">{{ t('search.start_title') }}</h3>
                <p class="text-sm text-gray-500">
                    {{ t('search.start_description') }}
                </p>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
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
    IonInput,
    IonSpinner
} from '@ionic/vue';
import {
    searchOutline,
    closeOutline,
    chevronBackOutline,
    chevronForwardOutline,
    chevronDownOutline
} from 'ionicons/icons';
import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import { useI18n } from 'vue-i18n';
import { useLocationsStore } from '../store/locationsStore';
import { useAppStore } from '../store/appStore';
import LocationCard from './LocationCard.vue';

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['close', 'select-location']);

// i18n
const { t } = useI18n();

// Store
const locationsStore = useLocationsStore();
const appStore = useAppStore();
const {
    searchResults,
    searchQuery,
    searchPagination,
    hasSearchResults,
    isSearching,
    searchQueryEmpty
} = storeToRefs(locationsStore);
const { geo } = storeToRefs(appStore);

// Local state
const searchQueryLocal = ref('');
const selectedCategory = ref('all');
const categories = ref([]);
const userLocation = ref(null);
const searchInput = ref(null);
const isCategoryDropdownOpen = ref(false);
const selectedCategoryObj = ref(null);

// Debouncing für Live-Suche
let searchTimeout = null;

// Computed
const searchQueryComputed = computed({
    get: () => searchQueryLocal.value,
    set: (value) => {
        searchQueryLocal.value = value;
    }
});

// Methods
const handleSearchInput = (event) => {
    const query = event.target.value;
    searchQueryComputed.value = query;

    // Debouncing: 300ms warten nach dem letzten Tippen
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        performSearch();
    }, 300);
};

const handleEnterKey = () => {
    // Focus vom Input entfernen
    if (searchInput.value) {
        searchInput.value.$el.querySelector('input').blur();
    }
};


const performSearch = async () => {
    const query = searchQueryComputed.value.trim();

    // Nur suchen wenn mindestens 3 Zeichen eingegeben wurden
    if (query.length < 3) {
        return;
    }

    const filters = {
        category: selectedCategory.value
    };

    try {
        await locationsStore.searchLocations(query, filters, 1, 20, userLocation.value);
    } catch (error) {
        console.error('Search error:', error);
    }
};

const handleDismiss = () => {
    emit('close');
    locationsStore.clearSearch();
    searchQueryComputed.value = '';
    selectedCategory.value = 'all';
    isCategoryDropdownOpen.value = false;
    selectedCategoryObj.value = null;
};

const selectLocation = (location) => {
    emit('close');
    setTimeout(() => {
        emit('select-location', location);
    }, 150);
};

const loadNextPage = async () => {
    try {
        await locationsStore.loadNextPage();
    } catch (error) {
        console.error('Error loading next page:', error);
    }
};

const loadPrevPage = async () => {
    try {
        await locationsStore.loadPrevPage();
    } catch (error) {
        console.error('Error loading prev page:', error);
    }
};

const focusSearchInput = () => {
    setTimeout(() => {
        searchInput.value.$el.querySelector('input').focus();
    }, 300);
};

const toggleCategoryDropdown = () => {
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};

const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId;
    selectedCategoryObj.value = categories.value.find(cat => cat.id === categoryId) || null;
    isCategoryDropdownOpen.value = false;

    focusSearchInput();
    if (searchQueryComputed.value.length > 2) {
        performSearch();
    }
};

// Click outside handler
const handleClickOutside = (event) => {
    const dropdown = event.target.closest('.relative');
    if (!dropdown && isCategoryDropdownOpen.value) {
        isCategoryDropdownOpen.value = false;
    }
};

// Load categories on mount
onMounted(async() => {
    try {
        categories.value = await locationsStore.getCategories();
        // Setze User-Location für Distanzberechnung
        if (geo.value) {
            userLocation.value = geo.value;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }

    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Watch für User-Location Updates
watch(geo, (newGeo) => {
    if (newGeo) {
        userLocation.value = newGeo;
    }
});

// Watch for prop changes
watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        // Modal wurde geöffnet - setze lokalen State zurück
        searchQueryComputed.value = '';
        selectedCategory.value = 'all';
        locationsStore.clearSearch();
        isCategoryDropdownOpen.value = false;
        selectedCategoryObj.value = null;

        focusSearchInput();
    }
});

</script>
