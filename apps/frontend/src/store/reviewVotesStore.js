import { defineStore } from 'pinia'
import apiCall from '../composables/apiCall'

export const useReviewVotesStore = defineStore('reviewVotes', {
    state: () => ({
        votesByReview: {},
        userVotes: {},
    }),

    getters: {
        getUserVoteForReview: (state) => (reviewId) => {
            return state.userVotes[reviewId] || null
        },
        getVoteCounts: (state) => (reviewId) => {
            return state.votesByReview[reviewId] || { upvotes: 0, downvotes: 0 }
        },
    },

    actions: {
        setVoteCountsFromReview(review) {
            if (!review?.id) return
            this.votesByReview[review.id] = {
                upvotes: review.upvotes || 0,
                downvotes: review.downvotes || 0,
            }
        },

        async fetchUserVotesForLocation(locationId, userId) {
            if (!locationId || !userId) return
            try {
                const response = await apiCall(
                    `review-votes?where[user][equals]=${userId}&depth=0&limit=100`
                )
                const votes = response.docs || []
                for (const vote of votes) {
                    const reviewId = typeof vote.review === 'object' ? vote.review.id : vote.review
                    this.userVotes[reviewId] = { id: vote.id, type: vote.type }
                }
            } catch (error) {
                console.error('Failed to fetch user votes:', error)
            }
        },

        async vote(reviewId, type, userId) {
            if (!reviewId || !type || !userId) return
            const existingVote = this.userVotes[reviewId]

            try {
                if (existingVote && existingVote.type === type) {
                    await apiCall(`review-votes/${existingVote.id}`, { method: 'DELETE' })
                    delete this.userVotes[reviewId]
                } else if (existingVote) {
                    await apiCall(`review-votes/${existingVote.id}`, {
                        method: 'PATCH',
                        data: { type },
                    })
                    this.userVotes[reviewId] = { ...existingVote, type }
                } else {
                    const response = await apiCall('review-votes', {
                        method: 'POST',
                        data: { review: reviewId, user: userId, type },
                    })
                    this.userVotes[reviewId] = { id: response.doc?.id || response.id, type }
                }

                const reviewResponse = await apiCall(`reviews/${reviewId}?depth=0`)
                if (reviewResponse) {
                    this.votesByReview[reviewId] = {
                        upvotes: reviewResponse.upvotes || 0,
                        downvotes: reviewResponse.downvotes || 0,
                    }
                }
            } catch (error) {
                if (error?.response?.data?.errors?.[0]?.message === 'VOTE_UPDATED') {
                    this.userVotes[reviewId] = { ...existingVote, type }
                } else {
                    console.error('Failed to vote:', error)
                }
            }
        },
    },
})
