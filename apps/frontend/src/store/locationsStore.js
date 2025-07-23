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
                    'select[createdAt]': 'true'
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

        // Kategorien für Filter laden
        async getCategories() {
            try {
                const response = await apiCall('categories', {
                    method: 'GET'
                });
                return response.docs || [];
            } catch (error) {
                console.error('Error loading categories:', error);
                return [];
            }
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
        }
    },
})
