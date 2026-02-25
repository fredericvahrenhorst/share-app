import type { Endpoint } from 'payload'

export const tagSearchEndpoint: Endpoint = {
    path: '/search/tags',
    method: 'get',
    handler: async (req) => {
        const { payload } = req
        const q = (req.query?.q as string) || ''

        try {
            const locations = await payload.find({
                collection: 'locations',
                where: { status: { equals: 'active' } },
                limit: 0,
                depth: 0,
            })

            if (q.trim()) {
                const searchTerm = q.trim().toLowerCase()
                const matchingTags: string[] = []

                for (const location of locations.docs) {
                    const tags = (location as any).tags
                    if (!Array.isArray(tags)) continue
                    for (const tagEntry of tags) {
                        const tagValue = tagEntry?.tag
                        if (
                            typeof tagValue === 'string' &&
                            tagValue.toLowerCase().includes(searchTerm)
                        ) {
                            if (!matchingTags.includes(tagValue)) {
                                matchingTags.push(tagValue)
                            }
                        }
                    }
                }

                return Response.json({
                    success: true,
                    tags: matchingTags,
                    total: matchingTags.length,
                })
            }

            const tagFrequency: Record<string, number> = {}

            for (const location of locations.docs) {
                const tags = (location as any).tags
                if (!Array.isArray(tags)) continue
                for (const tagEntry of tags) {
                    const tagValue = tagEntry?.tag
                    if (typeof tagValue === 'string' && tagValue.trim()) {
                        tagFrequency[tagValue] = (tagFrequency[tagValue] || 0) + 1
                    }
                }
            }

            const popularTags = Object.entries(tagFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([tag, count]) => ({ tag, count }))

            return Response.json({
                success: true,
                tags: popularTags,
                total: popularTags.length,
            })
        } catch (error: any) {
            console.error('Tag search error:', error)
            return Response.json(
                { error: 'Fehler bei der Tag-Suche', details: error.message },
                { status: 500 },
            )
        }
    },
}
