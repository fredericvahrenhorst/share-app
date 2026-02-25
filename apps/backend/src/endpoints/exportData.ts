import type { Endpoint } from 'payload'

export const exportDataEndpoint: Endpoint = {
    path: '/users/export-data',
    method: 'get',
    handler: async (req) => {
        if (!req.user) {
            return Response.json({ error: 'Authentifizierung erforderlich' }, { status: 401 })
        }

        const { payload } = req
        const userId = req.user.id

        try {
            const [
                favorites,
                reviews,
                reviewVotes,
                reports,
                activities,
                locationConfirmations,
                createdLocations,
            ] = await Promise.all([
                payload.find({
                    collection: 'favorites',
                    where: { user: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'reviews',
                    where: { user: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'review-votes',
                    where: { user: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'reports',
                    where: { reportedBy: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'activities',
                    where: { actor: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'location-confirmations',
                    where: { user: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
                payload.find({
                    collection: 'locations',
                    where: { createdBy: { equals: userId } },
                    limit: 0,
                    depth: 1,
                }),
            ])

            const userData = {
                profile: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    bio: (req.user as any).bio,
                    location: (req.user as any).location,
                    preferences: (req.user as any).preferences,
                    reputation: (req.user as any).reputation,
                    reputationLevel: (req.user as any).reputationLevel,
                    badges: (req.user as any).badges,
                    stats: (req.user as any).stats,
                    createdAt: (req.user as any).createdAt,
                    updatedAt: (req.user as any).updatedAt,
                },
                favorites: favorites.docs,
                reviews: reviews.docs,
                reviewVotes: reviewVotes.docs,
                reports: reports.docs,
                activities: activities.docs,
                locationConfirmations: locationConfirmations.docs,
                createdLocations: createdLocations.docs,
                exportedAt: new Date().toISOString(),
            }

            return Response.json(userData)
        } catch (error: any) {
            console.error('Export data error:', error)
            return Response.json(
                { error: 'Fehler beim Exportieren der Daten', details: error.message },
                { status: 500 },
            )
        }
    },
}
