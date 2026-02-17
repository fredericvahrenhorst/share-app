/* eslint-disable */
import { defineStore } from 'pinia';
import apiCall from '../composables/apiCall';
import { distance as turfDistance } from '@turf/distance';
import { point } from '@turf/helpers';
import { storeToRefs } from 'pinia';
import { useAppStore } from './appStore';

const appStore = useAppStore();
const { geo } = storeToRefs(appStore);

export const useLocationsStore = defineStore('locations', {
    state: () => ({
        locations: [],
        nearbyLocations: [],
        visitedlocations: JSON.parse(localStorage.getItem('visitedlocations')),
        favorites: [],
        isLoading: false,
        // Neue State-Variablen für die Suche
        searchResults: [],
        searchLoading: false,
        searchQuery: '',
        searchFilters: {
            category: 'all'
        },
        searchPagination: {
            page: 1,
            totalPages: 1,
            totalDocs: 0,
            hasNextPage: false,
            hasPrevPage: false
        },
        popupLocation: null,
        // Filter State
        categories: [],
        filteredLocations: [],
        filterState: (() => {
            // Try to load filters from localStorage on store initialization
            try {
                const savedFilters = localStorage.getItem('locationFilters');
                if (savedFilters) {
                    return JSON.parse(savedFilters);
                }
            } catch (error) {
                console.error('Error loading filters from localStorage on init:', error);
            }

            // Default values if no saved filters
            return {
                categories: [],
                radius: 0,
            };
        })(),
    }),
    getters: {
        // Getter für Suchstatus
        hasSearchResults: (state) => state.searchResults?.length > 0,
        isSearching: (state) => state.searchLoading,
        searchQueryEmpty: (state) => !state.searchQuery.trim(),
    },
    actions: {
        async getLocationBySlug (slug) {
            if (!slug) return;

            const response = await apiCall (`locations/${slug}`, {
                method: 'GET'
            });

            if (!this.locations.find(e => e.slug === response.slug)) {
                this.locations.push(response);
            }

            return response;
        },

        async getAllLocations () {
            this.isLoading = true;
            let response = null;

            try {
                // Optimize API call for map markers: fetch all locations without pagination
                // and only include fields needed for map display
                const params = new URLSearchParams({
                    limit: '9999', // Get all locations without pagination
                    'select[id]': 'true',
                    'select[name]': 'true',
                    'select[coordinates]': 'true',
                    'select[category]': 'true',
                    'select[status]': 'true',
                    'select[createdAt]': 'true',
                    'select[openingHours]': 'true',
                    'select[averageRating]': 'true',
                    'select[reviewCount]': 'true'
                });

                response = await apiCall(`locations?${params.toString()}`, {
                    method: 'GET'
                });

                if (response.success) {
                    const { docs } = response;

                    docs.forEach(location => {
                        if (!this.locations.find(e => e.id === location.id)) {
                            this.locations.push(location);
                        }
                    });

                    // Load categories from locations and filters
                    this.loadCategoriesFromLocations();
                    this.loadFiltersFromLocalStorage();
                }
            } catch (error) {
                console.error('Error loading locations:', error);
                return [];
            } finally {
                this.isLoading = false;
            }

            return response;
        },

        /**
         * Holt alle Standorte in der Nähe des aktuellen Standorts des Nutzers.
         * Optional kann ein Radius (in km) und eine Kategorie übergeben werden.
         * Gibt ein Array von Standorten mit Distanz zurück.
         *
         * @param {Object} options - Optionen für die Suche
         * @param {number} [options.radius] - Radius in km (optional, Standard aus appStore)
         * @param {string} [options.category] - Kategorie-Slug (optional)
         * @returns {Promise<Array>} - Array von Standorten mit Distanz
         */
        async getNearbyLocations({ radius, category } = {}) {
            this.isLoading = true;
            let response = null;

            try {
                // Hole aktuellen Standort aus appStore
                const appStore = useAppStore();
                const geo = appStore.geo;

                if (!geo || !geo.lat || !geo.long) {
                    throw new Error('Kein Standort verfügbar');
                }

                const params = new URLSearchParams({
                    latitude: geo.lat,
                    longitude: geo.long,
                    radius: (radius || appStore.radius || 5).toString()
                });

                if (category) {
                    params.append('category', category);
                }

                response = await apiCall(`search/locations/nearby?${params.toString()}`, {
                    method: 'GET'
                });

                if (response.success) {
                    // response.data enthält die Standorte mit Distanz
                    this.nearbyLocations = response.data;
                } else {
                    this.nearbyLocations = [];
                }
            } catch (error) {
                console.error('Fehler beim Laden der Standorte in der Nähe:', error);
                this.nearbyLocations = [];
            } finally {
                this.isLoading = false;
            }

            return response;
        },

        // Neue Action für die Suche
        async searchLocations(query = '', filters = {}, page = 1, limit = 20) {
            // Setze Loading-Status
            this.searchLoading = true;
            this.searchQuery = query;

            try {
                // Baue Query-Parameter
                const params = new URLSearchParams({
                    query: query.trim(),
                    category: filters.category || 'all',
                    page: page.toString(),
                    limit: limit.toString()
                });

                const response = await apiCall(`search/locations?${params.toString()}`, {
                    method: 'GET'
                });

                if (response.success) {
                    let results = response.data;
                    // Distanzberechnung und Sortierung


                    if (geo.value && Array.isArray(results)) {
                        results = this.addDistanceToLocations(results);
                        results = this.sortLocationsByDistance(results);
                    }
                    this.searchResults = results;
                    this.searchPagination = response.pagination;
                    this.searchFilters = { ...this.searchFilters, ...filters };
                } else {
                    console.error('Search failed:', response.error);
                    this.searchResults = [];
                }

                return response;
            } catch (error) {
                console.error('Search error:', error);
                this.searchResults = [];
                throw error;
            } finally {
                this.searchLoading = false;
            }
        },

        // Suche zurücksetzen
        clearSearch() {
            this.searchResults = [];
            this.searchQuery = '';
            this.searchFilters = { category: 'all' };
            this.searchPagination = {
                page: 1,
                totalPages: 1,
                totalDocs: 0,
                hasNextPage: false,
                hasPrevPage: false
            };
        },



        // Nächste Seite laden (für Pagination)
        async loadNextPage() {
            if (this.searchPagination.hasNextPage) {
                const nextPage = this.searchPagination.page + 1;
                return await this.searchLocations(
                    this.searchQuery,
                    this.searchFilters,
                    nextPage,
                    20
                );
            }
        },

        // Vorherige Seite laden (für Pagination)
        async loadPrevPage() {
            if (this.searchPagination.hasPrevPage) {
                const prevPage = this.searchPagination.page - 1;
                return await this.searchLocations(
                    this.searchQuery,
                    this.searchFilters,
                    prevPage,
                    20
                );
            }
        },
        addDistanceToLocations(locations) {
            const userPoint = point([geo.value.long, geo.value.lat]);
            return locations.map(location => {
                if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
                    const locationPoint = point(location.coordinates);
                    const dist = turfDistance(userPoint, locationPoint, { units: 'meters' });
                    return { ...location, distance: dist };
                }
                return location;
            });
        },
        sortLocationsByDistance(locations) {
            return locations?.sort((a, b) => {
                if (a.distance && b.distance) {
                    return a.distance - b.distance;
                }
            });
        },

        setPopupLocation(location) {
            // Vue reactivity verlangt, dass wir ein neues Objekt zuweisen, um Proxy-Probleme zu vermeiden
            this.popupLocation = location ? { ...location } : null;
        },
        clearPopupLocation() {
            this.popupLocation = null;
        },

        loadCategoriesFromLocations() {
            // Extrahiere unique Kategorien aus den Locations
            const categoryMap = new Map();

            this.locations.forEach(location => {
                if (location.category) {
                    const categoryId = location.category.id || location.category;
                    const categoryName = location.category.name || 'Unbekannte Kategorie';
                    const categoryColor = location.category.color || '#6366F1';
                    const categoryIcon = location.category.icon || 'location-outline';

                    if (!categoryMap.has(categoryId)) {
                        categoryMap.set(categoryId, {
                            id: categoryId,
                            name: categoryName,
                            color: categoryColor,
                            icon: categoryIcon,
                            description: location.category.description || ''
                        });
                    }
                }
            });

            this.categories = Array.from(categoryMap.values());
        },

        applyFilters(filterOptions) {
            // Update filter state
            this.filterState = { ...this.filterState, ...filterOptions };

            // Save to local storage
            localStorage.setItem('locationFilters', JSON.stringify(this.filterState));

            // Update filtered locations
            this.updateFilteredLocations();
        },

        clearFilters() {
            this.filterState = {
                categories: [],
                radius: 0,
            };

            localStorage.removeItem('locationFilters');

            // Update filtered locations
            this.updateFilteredLocations();
        },

        // Load filters from local storage on app start
        loadFiltersFromLocalStorage() {
            try {
                const savedFilters = localStorage.getItem('locationFilters');
                if (savedFilters) {
                    const parsedFilters = JSON.parse(savedFilters);
                    // Only update if we have valid data
                    if (parsedFilters && typeof parsedFilters === 'object') {
                        this.filterState = { ...this.filterState, ...parsedFilters };
                        console.log('Filters loaded from localStorage:', this.filterState);
                    }
                }
            } catch (error) {
                console.error('Error loading filters from localStorage:', error);
            }
        },

        // Methode um Locations aus Props in den Store zu laden
        setLocationsFromProps(locations) {
            this.locations = [...locations];

            // Lade Kategorien aus den Locations
            this.loadCategoriesFromLocations();

            // Lade gespeicherte Filter aus localStorage
            this.loadFiltersFromLocalStorage();

            // Update filtered locations
            this.updateFilteredLocations();
        },

        // Update filtered locations based on current filter state
        updateFilteredLocations() {
            let locations = this.locations;

            // Apply filters if any are set
            if (this.filterState.categories.length > 0
            || (this.filterState.radius && this.filterState.radius !== 0)) {
                console.log('Applying filters to locations...');

                locations = locations.filter((loc) => {
                    // Category filter
                    if (this.filterState.categories.length > 0) {
                        const categoryId = loc.category?.id || loc.category;

                        if (!this.filterState.categories.includes(categoryId)) {
                            return false;
                        }
                    }

                    // Radius filter (if geo is available)
                    if (this.filterState.radius && this.filterState.radius !== 0) {
                        const appStore = useAppStore();
                        const geo = appStore.geo;

                        if (geo && loc.coordinates && Array.isArray(loc.coordinates)) {
                            const userPoint = point([geo.long, geo.lat]);
                            const locationPoint = point(loc.coordinates);
                            const distance = turfDistance(userPoint, locationPoint, { units: 'meters' });
                            const maxDistance = this.filterState.radius * 1000; // Convert to meters

                            if (distance > maxDistance) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }

                    return true;
                });

                console.log('Filtered locations count:', locations.length);
            } else {
                console.log('No filters applied, showing all locations');
            }

            this.filteredLocations = locations;
        }
    },
})
