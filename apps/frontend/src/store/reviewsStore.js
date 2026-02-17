import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'

export const useReviewsStore = defineStore('reviews', {
    state: () => ({
        reviewsByLocation: {}, // Map: locationId -> [reviews]
        isLoading: false,
    }),

    getters: {
        getReviewsByLocationId: (state) => (locationId) => {
            return state.reviewsByLocation[locationId] || []
        },
    },

    actions: {
        async fetchReviews(locationId) {
            if (!locationId) return
            this.isLoading = true
            try {
                // Lade aktive Reviews für den Standort, sortiert nach Datum (neueste zuerst)
                const response = await apiCall(
                    `reviews?where[location][equals]=${locationId}&where[status][equals]=active&sort=-createdAt&depth=2`
                )
                // Speichere die Reviews im State
                this.reviewsByLocation[locationId] = response.docs || []
            } catch (error) {
                console.error('Failed to fetch reviews:', error)
            } finally {
                this.isLoading = false
            }
        },

        async addReview({ locationId, rating, comment, userId }) {
            if (!locationId || !rating) return
            this.isLoading = true
            try {
                const payload = {
                    location: locationId,
                    rating,
                    comment,
                    user: userId, // User ID muss mitgeschickt werden
                    status: 'active', // Direkt aktiv für MVP
                }

                await apiCall('reviews', {
                    method: 'POST',
                    data: payload,
                })

                // Nach erfolgreichem Hinzufügen neu laden
                await this.fetchReviews(locationId)
                return true
            } catch (error) {
                console.error('Failed to add review:', error)
                throw error
            } finally {
                this.isLoading = false
            }
        },
    },
})
