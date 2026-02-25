import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'

export const useConfirmationsStore = defineStore('confirmations', {
    state: () => ({
        confirmationsByLocation: {},
        userConfirmations: {},
    }),

    getters: {
        hasUserConfirmed: (state) => (locationId) => {
            return !!state.userConfirmations[locationId]
        },
        getConfirmationCount: (state) => (locationId) => {
            return state.confirmationsByLocation[locationId] || 0
        },
    },

    actions: {
        async fetchConfirmations(locationId) {
            if (!locationId) return
            try {
                const response = await apiCall(
                    `location-confirmations?where[location][equals]=${locationId}&limit=0`
                )
                this.confirmationsByLocation[locationId] = response.totalDocs || 0
            } catch (error) {
                console.error('Failed to fetch confirmations:', error)
            }
        },

        async fetchUserConfirmation(locationId, userId) {
            if (!locationId || !userId) return
            try {
                const response = await apiCall(
                    `location-confirmations?where[location][equals]=${locationId}&where[user][equals]=${userId}&limit=1`
                )
                if (response.totalDocs > 0) {
                    this.userConfirmations[locationId] = response.docs[0]
                }
            } catch (error) {
                console.error('Failed to fetch user confirmation:', error)
            }
        },

        async confirmLocation(locationId, userId, comment) {
            if (!locationId || !userId) return
            try {
                await apiCall('location-confirmations', {
                    method: 'POST',
                    data: {
                        location: locationId,
                        user: userId,
                        comment: comment || undefined,
                    },
                })
                this.userConfirmations[locationId] = true
                await this.fetchConfirmations(locationId)
                return true
            } catch (error) {
                console.error('Failed to confirm location:', error)
                throw error
            }
        },
    },
})
