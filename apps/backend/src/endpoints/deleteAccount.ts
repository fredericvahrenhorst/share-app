import type { Endpoint } from 'payload'

export const deleteAccountEndpoint: Endpoint = {
    path: '/users/delete-account',
    method: 'delete',
    handler: async (req) => {
        const { payload } = req
        const user = req.user

        if (!user) {
            return Response.json(
                { error: 'Nicht authentifiziert.' },
                { status: 401 },
            )
        }

        const userId = user.id

        try {
            const favorites = await payload.find({
                collection: 'favorites',
                where: { user: { equals: userId } },
                limit: 0,
            })
            for (const fav of favorites.docs) {
                await payload.delete({ collection: 'favorites', id: fav.id })
            }

            const reviews = await payload.find({
                collection: 'reviews',
                where: { user: { equals: userId } },
                limit: 0,
            })
            for (const review of reviews.docs) {
                await payload.delete({ collection: 'reviews', id: review.id })
            }

            const reviewVotes = await payload.find({
                collection: 'review-votes',
                where: { user: { equals: userId } },
                limit: 0,
            })
            for (const vote of reviewVotes.docs) {
                await payload.delete({ collection: 'review-votes', id: vote.id })
            }

            const reports = await payload.find({
                collection: 'reports',
                where: { reportedBy: { equals: userId } },
                limit: 0,
            })
            for (const report of reports.docs) {
                await payload.delete({ collection: 'reports', id: report.id })
            }

            const confirmations = await payload.find({
                collection: 'location-confirmations',
                where: { user: { equals: userId } },
                limit: 0,
            })
            for (const conf of confirmations.docs) {
                await payload.delete({ collection: 'location-confirmations', id: conf.id })
            }

            const activities = await payload.find({
                collection: 'activities',
                where: { actor: { equals: userId } },
                limit: 0,
            })
            for (const act of activities.docs) {
                await payload.delete({ collection: 'activities', id: act.id })
            }

            const locations = await payload.find({
                collection: 'locations',
                where: { createdBy: { equals: userId } },
                limit: 0,
            })
            for (const loc of locations.docs) {
                await payload.update({
                    collection: 'locations',
                    id: loc.id,
                    data: { createdBy: null as any },
                })
            }

            await payload.delete({ collection: 'users', id: userId })

            return Response.json({
                success: true,
                message: 'Dein Account und alle zugehörigen Daten wurden gelöscht.',
                deletedData: {
                    favorites: favorites.totalDocs,
                    reviews: reviews.totalDocs,
                    reviewVotes: reviewVotes.totalDocs,
                    reports: reports.totalDocs,
                    confirmations: confirmations.totalDocs,
                    activities: activities.totalDocs,
                    locationsAnonymized: locations.totalDocs,
                },
            })
        } catch (error: any) {
            console.error('Account deletion error:', error)
            return Response.json(
                { error: 'Fehler beim Löschen des Accounts.', details: error.message },
                { status: 500 },
            )
        }
    },
}
