import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'

export const useActivityStore = defineStore('activity', {
    state: () => ({
        activities: [],
        isLoading: false,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
    }),

    actions: {
        async fetchActivities(page = 1) {
            this.isLoading = true
            try {
                const response = await apiCall(`community/feed?page=${page}&limit=20`)
                if (page === 1) {
                    this.activities = response.docs || []
                } else {
                    this.activities = [...this.activities, ...(response.docs || [])]
                }
                this.currentPage = response.page || 1
                this.totalPages = response.totalPages || 1
                this.hasNextPage = response.hasNextPage || false
            } catch (error) {
                console.error('Failed to fetch activities:', error)
            } finally {
                this.isLoading = false
            }
        },

        async loadMore() {
            if (this.hasNextPage && !this.isLoading) {
                await this.fetchActivities(this.currentPage + 1)
            }
        },
    },
})
