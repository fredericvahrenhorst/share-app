<template>
    <ion-modal
        :is-open="isOpen"
        @didDismiss="handleDismiss"
        :initial-breakpoint="1" :breakpoints="[0, 0.5, 0.75, 1]"
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
            <!-- Tab-Switch für lokale vs externe Suche -->
            <div class="mb-4">
                <ion-segment :value="searchMode" @ionChange="setSearchMode($event.detail.value)" class="bg-gradient-purple-blue">
                    <ion-segment-button value="external">
                        <div class="flex items-center gap-1 transition-colors"
                        :class="{'text-light-gray-96': searchMode === 'external'}">
                            <ion-icon :icon="globeOutline" class="h-4 w-4" />
                            <ion-label>{{ t('search.external_places') }}</ion-label>
                        </div>
                    </ion-segment-button>
                    <ion-segment-button class="my-2 mx-1" value="local">
                        <div class="flex items-center gap-1 transition-colors"
                        :class="{'text-light-gray-96': searchMode === 'local'}">
                            <ion-icon :icon="locationOutline" class="h-4 w-4"/>
                            <ion-label>{{ t('search.local_places') }}</ion-label>
                        </div>
                    </ion-segment-button>
                </ion-segment>
            </div>

            <!-- Suchfeld -->
            <div class="mb-4">
                <ion-item class="blur-bg" lines="none">
                    <ion-icon :icon="searchOutline" size="small" slot="start" class="text-current mr-2" />
                    <ion-input
                        ref="searchInput"
                        v-model="searchQuery"
                        :placeholder="searchMode === 'local' ? t('search.placeholder-local') : t('search.placeholder_external')"
                        @ionInput="handleSearchInput"
                        @keydown.enter="handleEnterKey"
                        clear-input
                    />
                </ion-item>
            </div>

            <!-- Kategorie-Filter (nur für lokale Suche) -->
            <div v-if="searchMode === 'local'" class="mb-4">
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
            <div v-else-if="hasSearchResults || mapboxResults.length > 0" class="space-y-3">
                <div class="text-sm text-gray-600 mb-4">
                    {{ searchMode === 'local' ? searchPagination.totalDocs : mapboxResults.length }}
                    {{ searchPagination.totalDocs !== 1 ? t('search.results_found_plural')
                        : t('search.results_found') }}
                </div>

                <!-- Lokale Orte -->
                <template v-if="searchMode === 'local'">
                    <LocationCard
                        v-for="location in searchResults"
                        :key="location.id"
                        :location="location"
                        :category-obj="location.category"
                        @select="selectLocation"
                    />
                </template>

                <!-- Externe Orte (Mapbox) -->
                <template v-else>
                    <ion-card
                        v-for="place in mapboxResults"
                        :key="place.id"
                        class="blur-bg-light"
                        @click="selectExternalPlace(place)"
                        :aria-label="place.place_name_de || place.place_name"
                    >
                        <ion-card-content class="!p-3 imte">
                            <div class="text-sm text-dark font-semibold flex items-center">
                                <ion-icon :icon="locationOutline" class="mr-2 h-4.5 w-4.5 shrink-0" />
                                {{ place.place_name_de || place.place_name }}
                            </div>
                        </ion-card-content>
                    </ion-card>
                </template>
                <!-- Pagination (nur für lokale Suche) -->
                <div v-if="searchMode === 'local' && searchPagination.totalPages > 1" class="flex justify-center mt-6">
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
                    {{ searchMode === 'local' ? t('search.no_results_description') : t('search.no_results_description_external') }}
                </p>
            </div>

            <!-- Start-Zustand -->
            <div v-else class="text-center py-12">
                <ion-icon :icon="searchOutline" class="text-6xl text-gray-300 mb-4" />
                <h3 class="text-lg font-medium text-gray-600 mb-2">
                    {{ searchMode === 'local' ? t('search.start_title') : t('search.start_title_external') }}
                </h3>
                <p class="text-sm text-gray-500">
                    {{ searchMode === 'local' ? t('search.start_description') : t('search.start_description_external') }}
                </p>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import {
    ref,
    computed,
    watch,
    onMounted,
    onUnmounted
} from 'vue';
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
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from '@ionic/vue';
import {
    searchOutline,
    closeOutline,
    chevronBackOutline,
    chevronForwardOutline,
    chevronDownOutline,
    locationOutline,
    globeOutline
} from 'ionicons/icons';
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
const selectedCategory = ref('all');
const categories = ref([]);

const searchInput = ref(null);
const isCategoryDropdownOpen = ref(false);
const selectedCategoryObj = ref(null);
const searchMode = ref('external'); // 'local' oder 'external'
const mapboxResults = ref([]);
const isMapboxSearching = ref(false);

// Mapbox API Token
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

// Debouncing für Live-Suche
let searchTimeout = null;

// Methods
const setSearchMode = (mode) => {
    searchMode.value = mode;

    // Focus auf Input setzen
    focusSearchInput(100);

    performSearch();
};

const handleSearchInput = (event) => {
    const query = event.target.value;

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

const performSearch = async() => {
    const query = searchQuery.value;

    // Nur suchen wenn mindestens 3 Zeichen eingegeben wurden
    if (query.length < 3) {
        return;
    }

    if (searchMode.value === 'local') {
        await performLocalSearch(query);
    } else {
        await performMapboxSearch(query);
    }
};

const performLocalSearch = async (query) => {
    const filters = {
        category: selectedCategory.value
    };

    try {
        await locationsStore.searchLocations(query, filters, 1, 20);
    } catch (error) {
        console.error('Local search error:', error);
    }
};

const performMapboxSearch = async (query) => {
    if (!mapboxToken) {
        console.error('Mapbox token not found');
        return;
    }

    isMapboxSearching.value = true;

    try {
        // Mapbox Geocoding API aufrufen
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
            `access_token=${mapboxToken}&` +
            `country=DE&` + // Deutschland bevorzugen
            `language=de&` + // Deutsche Sprache
            `limit=10&` + // Max 10 Ergebnisse
            `types=place,address,poi` // Orte, Adressen und Points of Interest
        );

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.status}`);
        }

        const data = await response.json();
        mapboxResults.value = data.features || [];
    } catch (error) {
        console.error('Mapbox search error:', error);
        mapboxResults.value = [];
    } finally {
        isMapboxSearching.value = false;
    }
};

const selectExternalPlace = (place) => {
    console.log('place: ', place);
    // Konvertiere Mapbox-Ergebnis in Location-Format
    // this.geo = {
    //             lat: geoData.coords.latitude,
    //             long: geoData.coords.longitude,
    //             ts: geoData.timestamp
    //         };
    appStore.setGeoLatLong({
        coords: {
            latitude: place.center[1],
            longitude: place.center[0]
        },
        timestamp: Date.now()
    });

    const location = {
        coordinates: place.center, // [longitude, latitude]
        isExternal: true,
        mapboxData: place // Original Mapbox-Daten für weitere Verwendung
    };

    emit('close');
    setTimeout(() => {
        emit('select-location', location, true);
    }, 150);
};

const selectLocation = (location) => {
    emit('close');
    setTimeout(() => {
        emit('select-location', location);
    }, 150);
};

const handleDismiss = () => {
    emit('close');
    locationsStore.clearSearch();
    mapboxResults.value = [];
    searchQuery.value = '';
    selectedCategory.value = 'all';
    isCategoryDropdownOpen.value = false;
    selectedCategoryObj.value = null;
    searchMode.value = 'external';
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

const focusSearchInput = (timeout) => {
    setTimeout(() => {
        searchInput.value.$el.querySelector('input').focus();
    }, timeout);
};

const toggleCategoryDropdown = () => {
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};

const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId;
    selectedCategoryObj.value = categories.value.find(cat => cat.id === categoryId) || null;
    isCategoryDropdownOpen.value = false;

    focusSearchInput(0);
    if (searchQuery.value.length > 2) {
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
    } catch (error) {
        console.error('Error loading categories:', error);
    }

    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Watch for prop changes
watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        // Modal wurde geöffnet - setze lokalen State zurück
        searchQuery.value = '';
        selectedCategory.value = 'all';
        locationsStore.clearSearch();
        mapboxResults.value = [];
        isCategoryDropdownOpen.value = false;
        selectedCategoryObj.value = null;
        searchMode.value = 'external';

        focusSearchInput(300);
    }
});

</script>

<style scoped>
  ion-segment-button {
    margin: 0.25rem 0.25rem;
  }
</style>
