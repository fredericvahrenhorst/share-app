import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { isAuthenticated, isAdminOrOwner } from '../accessControl'

const updateReviewVoteCounts = async (req: any, reviewId: string | number) => {
    if (!reviewId) return
    const votes = await req.payload.find({
        collection: 'review-votes',
        where: { review: { equals: reviewId } },
        limit: 0,
    })
    const upvotes = votes.docs.filter((v: any) => v.type === 'up').length
    const downvotes = votes.docs.filter((v: any) => v.type === 'down').length
    await req.payload.update({
        collection: 'reviews',
        id: reviewId,
        data: { upvotes, downvotes },
    })
}

const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req }) => {
    const reviewId = typeof doc.review === 'object' ? doc.review.id : doc.review
    await updateReviewVoteCounts(req, reviewId)
    return doc
}

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
    const reviewId = typeof doc.review === 'object' ? doc.review.id : doc.review
    await updateReviewVoteCounts(req, reviewId)
    return doc
}

export const ReviewVotes: CollectionConfig = {
    slug: 'review-votes',
    admin: {
        useAsTitle: 'id',
    },
    access: {
        read: () => true,
        create: isAuthenticated,
        update: isAdminOrOwner('review-votes', 'user'),
        delete: isAdminOrOwner('review-votes', 'user'),
    },
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                if (req?.user?.id && !data.user) {
                    data.user = req.user.id
                }
                if (operation === 'create' && req?.user?.id) {
                    const existing = await req.payload.find({
                        collection: 'review-votes',
                        where: {
                            review: { equals: data.review },
                            user: { equals: req.user.id },
                        },
                        limit: 1,
                    })
                    if (existing.totalDocs > 0) {
                        const existingVote = existing.docs[0]
                        await req.payload.update({
                            collection: 'review-votes',
                            id: existingVote.id,
                            data: { type: data.type },
                        })
                        throw new Error('VOTE_UPDATED')
                    }
                }
                return data
            },
        ],
        afterChange: [afterChangeHook],
        afterDelete: [afterDeleteHook],
    },
    fields: [
        {
            name: 'review',
            type: 'relationship',
            relationTo: 'reviews',
            required: true,
            label: 'Bewertung',
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'Benutzer',
        },
        {
            name: 'type',
            type: 'select',
            required: true,
            label: 'Typ',
            options: [
                { label: 'Hilfreich', value: 'up' },
                { label: 'Nicht hilfreich', value: 'down' },
            ],
        },
    ],
}
