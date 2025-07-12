/* eslint-disable */
import { defineStore } from 'pinia';
import apiCall from '../composables/apiCall';

export const useLocationsStore = defineStore('locations', {
    state: () => ({
        locations: [],
        visitedlocations: JSON.parse(localStorage.getItem('visitedlocations')),
        favorites: [],
    }),
    getters: {
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
             const response = await apiCall ('locations', {
                method: 'GET'
            });

            const { docs } = response;

            docs.forEach(location => {
                if (!this.locations.find(e => e.slug === location.slug)) {
                    this.locations.push(location);
                }
            });

            return response;
        },
    },
})
