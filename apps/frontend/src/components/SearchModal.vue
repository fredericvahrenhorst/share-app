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

                <ion-card
                    v-for="location in sortedSearchResults"
                    :key="location.id"
                    class="blur-bg-light text-white"
                    @click="selectLocation(location)"
                >

                    <ion-card-content>
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <ion-card-title class="text-lg font-semibold">
                                    {{ location.name }}
                                </ion-card-title>
                                <ion-card-subtitle v-if="location.category" class="flex items-center mt-1">
                                    <div
                                        class="w-3 h-3 rounded-full mr-2"
                                        :style="{ backgroundColor: location.category.color || '#6366F1' }"
                                    ></div>
                                    {{ location.category.name }}
                                </ion-card-subtitle>
                            </div>
                            <!-- Distanz-Anzeige -->
                            <div
                                v-if="location.distance"
                                class="text-xs text-light-gray-96 bg-blue-100 px-2 py-1 rounded-full"
                            >
                                {{ formatDistance(location.distance) }}
                            </div>
                        </div>

                        <!-- Adresse -->
                        <div v-if="location.address" class="mb-2 text-sm text-gray-600">
                            <ion-icon :icon="locationOutline" class="mr-1" />
                            {{ formatAddress(location.address) }}
                        </div>

                        <!-- Beschreibung -->
                        <div v-if="location.description" class="text-sm text-gray-700 line-clamp-2">
                            {{ stripHtml(location.description) }}
                        </div>

                        <!-- Tags -->
                        <div v-if="location.tags && location.tags.length > 0" class="mt-2">
                            <ion-chip
                                v-for="tag in location.tags.slice(0, 3)"
                                :key="tag.tag"
                                size="small"
                                color="primary"
                            >
                                {{ tag.tag }}
                            </ion-chip>
                        </div>
                    </ion-card-content>
                </ion-card>

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
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip
} from '@ionic/vue';
import {
    searchOutline,
    closeOutline,
    locationOutline,
    chevronBackOutline,
    chevronForwardOutline,
    chevronDownOutline
} from 'ionicons/icons';
import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import { useI18n } from 'vue-i18n';
import { useLocationsStore } from '../store/locationsStore';
import { useAppStore } from '../store/appStore';

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
        await locationsStore.searchLocations(query, filters, 1, 20);
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

const formatAddress = (address) => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`);
    } else if (address.city) {
        parts.push(address.city);
    }
    return parts.join(', ');
};

const stripHtml = (html) => {
    if (!html) return '';
    // Einfache HTML-Strip-Funktion
    return `${html.replace(/<[^>]*>/g, '').substring(0, 150)}...`;
};

const formatDistance = (distance) => {
    if (distance < 1000) {
        return `${distance.toFixed(0)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
};



const calculateDistances = (locations) => {
    if (!userLocation.value || !locations.length) return locations;

    const userPoint = point([userLocation.value.long, userLocation.value.lat]);

    return locations.map(location => {
        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            const locationPoint = point(location.coordinates);
            const dist = distance(userPoint, locationPoint, { units: 'meters' });
            return { ...location, distance: dist };
        }
        return location;
    });
};

const sortedSearchResults = computed(() => {
    const locationsWithDistance = calculateDistances(searchResults.value);
    return locationsWithDistance.sort((a, b) => {
        if (a.distance && b.distance) {
            return a.distance - b.distance;
        }
        if (a.distance) return -1;
        if (b.distance) return 1;
        return 0;
    });
});

// Load categories on mount
onMounted(async () => {
    try {
        categories.value = await locationsStore.getCategories();
        // Setze User-Location für Distanzberechnung
        if (geo.value) {
            userLocation.value = geo.value;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
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

        // Fokussiere das Suchfeld nach kurzer Verzögerung
        focusSearchInput();
    }
});

const focusSearchInput = () => {
    if (searchInput.value) {
        setTimeout(() => {
            searchInput.value.$el.querySelector('input').focus();
        }, 150);
    }
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

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
