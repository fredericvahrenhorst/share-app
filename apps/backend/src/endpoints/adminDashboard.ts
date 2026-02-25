import type { Endpoint } from 'payload'

export const adminDashboardEndpoint: Endpoint = {
    path: '/admin/dashboard',
    method: 'get',
    handler: async (req) => {
        const { payload } = req
        const user = req.user as any

        if (!user || !user.roles?.includes('admin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 })
        }

        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const [totalUsers, totalLocations, totalReviews, totalReports, openReports, 
               recentLocations, recentUsers, recentReviews, pendingLocations] = await Promise.all([
            payload.find({ collection: 'users', limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'locations', limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'reviews', limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'reports', limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'reports', where: { status: { equals: 'open' } }, limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'locations', where: { createdAt: { greater_than: oneDayAgo.toISOString() } }, limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'users', where: { createdAt: { greater_than: oneWeekAgo.toISOString() } }, limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'reviews', where: { createdAt: { greater_than: oneWeekAgo.toISOString() } }, limit: 0 }).then(r => r.totalDocs),
            payload.find({ collection: 'locations', where: { status: { equals: 'pending' } }, limit: 0 }).then(r => r.totalDocs),
        ])

        return Response.json({
            totals: { users: totalUsers, locations: totalLocations, reviews: totalReviews, reports: totalReports },
            recent: { locationsToday: recentLocations, usersThisWeek: recentUsers, reviewsThisWeek: recentReviews },
            moderation: { openReports, pendingLocations },
        })
    },
}
