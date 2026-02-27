import type { Endpoint } from 'payload'

export const deleteAccountEndpoint: Endpoint = {
    path: '/users/delete-account',
    method: 'delete',
    handler: async (req) => {
        if (!req.user) {
            return Response.json({ error: 'Authentifizierung erforderlich' }, { status: 401 })
        }

        const { payload } = req
        const userId = req.user.id

        try {
            await Promise.all([
                payload.delete({
                    collection: 'favorites',
                    where: { user: { equals: userId } },
                }),
                payload.delete({
                    collection: 'reviews',
                    where: { user: { equals: userId } },
                }),
                payload.delete({
                    collection: 'review-votes',
                    where: { user: { equals: userId } },
                }),
                payload.delete({
                    collection: 'reports',
                    where: { reportedBy: { equals: userId } },
                }),
                payload.delete({
                    collection: 'activities',
                    where: { actor: { equals: userId } },
                }),
                payload.delete({
                    collection: 'location-confirmations',
                    where: { user: { equals: userId } },
                }),
            ])

            await payload.delete({
                collection: 'users',
                id: userId,
            })

            return Response.json({ success: true, message: 'Konto erfolgreich gelöscht' })
        } catch (error: any) {
            console.error('Delete account error:', error)
            return Response.json(
                { error: 'Fehler beim Löschen des Kontos', details: error.message },
                { status: 500 },
            )
        }
    },
}
