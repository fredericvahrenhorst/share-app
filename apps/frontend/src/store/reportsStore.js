import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'

export const useReportsStore = defineStore('reports', {
    state: () => ({
        isLoading: false,
    }),

    actions: {
        async reportLocation({ locationId, reason, description, userId }) {
            if (!locationId || !reason) return
            this.isLoading = true
            try {
                const payload = {
                    location: locationId,
                    reason,
                    description,
                    reportedBy: userId, // Backend erwartet 'reportedBy'
                    status: 'open', // Backend erwartet 'open'
                }

                await apiCall('reports', {
                    method: 'POST',
                    data: payload,
                })

                return true
            } catch (error) {
                console.error('Failed to report location:', error)
                throw error
            } finally {
                this.isLoading = false
            }
        },
    },
})
