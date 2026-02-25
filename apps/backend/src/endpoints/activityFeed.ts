import type { Endpoint } from 'payload'

export const activityFeedEndpoint: Endpoint = {
    path: '/community/feed',
    method: 'get',
    handler: async (req) => {
        const { payload } = req
        const page = Number(req.query?.page) || 1
        const limit = Math.min(Number(req.query?.limit) || 20, 50)

        const activities = await payload.find({
            collection: 'activities',
            sort: '-createdAt',
            page,
            limit,
            depth: 2,
        })

        return Response.json({
            docs: activities.docs,
            totalDocs: activities.totalDocs,
            totalPages: activities.totalPages,
            page: activities.page,
            hasNextPage: activities.hasNextPage,
        })
    },
}
