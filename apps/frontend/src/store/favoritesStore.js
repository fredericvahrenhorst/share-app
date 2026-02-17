/* eslint-disable */
import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'
import { useUserStore } from './userStore'

export const useFavoritesStore = defineStore('favorites', {
    state: () => ({
        favorites: [],
        isLoading: false,
    }),
    getters: {
        favoriteLocationIds: (state) =>
            state.favorites
                .map((f) => f.location?.id || f.location)
                .filter(Boolean),
        isFavorite: (state) => (locationId) => {
            const id = String(locationId)
            return state.favorites.some((f) => {
                const locId = f.location?.id || f.location
                return locId && String(locId) === id
            })
        },
        getFavoriteByLocationId: (state) => (locationId) => {
            const id = String(locationId)
            return state.favorites.find((f) => {
                const locId = f.location?.id || f.location
                return locId && String(locId) === id
            })
        },
    },
    actions: {
        async fetchFavorites() {
            const userStore = useUserStore()
            if (!userStore.userId || !userStore.authenticated) {
                this.favorites = []
                return
            }

            this.isLoading = true
            try {
                const params = new URLSearchParams({
                    'where[user][equals]': userStore.userId,
                    depth: '2',
                })
                const response = await apiCall(`favorites?${params.toString()}`, {
                    method: 'GET',
                })

                if (response?.docs) {
                    this.favorites = response.docs
                } else {
                    this.favorites = []
                }
            } catch (error) {
                this.favorites = []
            } finally {
                this.isLoading = false
            }
        },

        async addFavorite(locationId) {
            const userStore = useUserStore()
            if (!userStore.userId || !userStore.authenticated) {
                return
            }

            try {
                await apiCall('favorites', {
                    method: 'POST',
                    data: {
                        user: userStore.userId,
                        location: locationId,
                    },
                })
                await this.fetchFavorites()
            } catch (error) {
                throw error
            }
        },

        async removeFavorite(favoriteId) {
            try {
                await apiCall(`favorites/${favoriteId}`, {
                    method: 'DELETE',
                })
                this.favorites = this.favorites.filter((f) => f.id !== favoriteId)
            } catch (error) {
                throw error
            }
        },
    },
})
