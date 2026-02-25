/**
 * Community-Hooks: Reputation, Badge-Vergabe, Aktivitäts-Feed.
 * Werden in Locations, Reviews und Favorites afterChange/afterDelete registriert.
 */

const REPUTATION_POINTS = {
    location_created: 10,
    review_written: 5,
    location_favorited: 2,
}

const REPUTATION_LEVELS: Array<{ min: number; value: string }> = [
    { min: 100, value: 'legend' },
    { min: 50, value: 'hero' },
    { min: 15, value: 'active' },
    { min: 0, value: 'newcomer' },
]

function getReputationLevel(reputation: number): string {
    for (const level of REPUTATION_LEVELS) {
        if (reputation >= level.min) return level.value
    }
    return 'newcomer'
}

async function updateUserReputation(payload: any, userId: string | number) {
    if (!userId) return

    const user = await payload.findByID({ collection: 'users', id: userId })
    if (!user) return

    const locations = await payload.find({
        collection: 'locations',
        where: { createdBy: { equals: userId } },
        limit: 0,
    })
    const reviews = await payload.find({
        collection: 'reviews',
        where: { user: { equals: userId }, status: { equals: 'active' } },
        limit: 0,
    })
    const favorited = await payload.find({
        collection: 'favorites',
        where: { user: { equals: userId } },
        limit: 0,
    })

    const reputation =
        locations.totalDocs * REPUTATION_POINTS.location_created +
        reviews.totalDocs * REPUTATION_POINTS.review_written +
        favorited.totalDocs * REPUTATION_POINTS.location_favorited
    const reputationLevel = getReputationLevel(reputation)

    await payload.update({
        collection: 'users',
        id: userId,
        data: {
            reputation,
            reputationLevel,
            stats: {
                locationsCreated: locations.totalDocs,
                reviewsWritten: reviews.totalDocs,
                favoritesCount: favorited.totalDocs,
            },
        },
    })
}

function hasBadge(badges: Array<{ badge: string }> | undefined, badgeName: string): boolean {
    if (!badges || !Array.isArray(badges)) return false
    return badges.some((b) => b.badge === badgeName)
}

async function checkAndAwardBadges(payload: any, userId: string | number) {
    if (!userId) return

    const user = await payload.findByID({ collection: 'users', id: userId })
    if (!user) return

    const currentBadges: Array<{ badge: string; earnedAt: string }> = user.badges || []
    const newBadges: Array<{ badge: string; earnedAt: string }> = []
    const now = new Date().toISOString()

    const locations = await payload.find({
        collection: 'locations',
        where: { createdBy: { equals: userId } },
        limit: 0,
    })
    if (locations.totalDocs >= 1 && !hasBadge(currentBadges, 'creator')) {
        newBadges.push({ badge: 'creator', earnedAt: now })
    }

    const reviews = await payload.find({
        collection: 'reviews',
        where: { user: { equals: userId }, status: { equals: 'active' } },
        limit: 0,
    })
    if (reviews.totalDocs >= 10 && !hasBadge(currentBadges, 'verified')) {
        newBadges.push({ badge: 'verified', earnedAt: now })
    }

    if (reviews.totalDocs >= 5 && locations.totalDocs >= 3 && !hasBadge(currentBadges, 'helper')) {
        newBadges.push({ badge: 'helper', earnedAt: now })
    }

    if (newBadges.length > 0) {
        await payload.update({
            collection: 'users',
            id: userId,
            data: { badges: [...currentBadges, ...newBadges] },
        })
        for (const badge of newBadges) {
            await payload.create({
                collection: 'activities',
                data: {
                    type: 'badge_earned',
                    actor: userId,
                    metadata: { badge: badge.badge },
                },
            })
        }
    }
}

export async function onLocationCreated(payload: any, doc: any) {
    const userId = typeof doc.createdBy === 'object' ? doc.createdBy?.id : doc.createdBy
    if (!userId) return

    await payload.create({
        collection: 'activities',
        data: {
            type: 'location_created',
            actor: userId,
            location: doc.id,
        },
    })
    await updateUserReputation(payload, userId)
    await checkAndAwardBadges(payload, userId)
}

export async function onReviewCreated(payload: any, doc: any) {
    const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user
    if (!userId) return

    const locationId = typeof doc.location === 'object' ? doc.location?.id : doc.location
    await payload.create({
        collection: 'activities',
        data: {
            type: 'review_added',
            actor: userId,
            location: locationId,
            review: doc.id,
        },
    })
    await updateUserReputation(payload, userId)
    await checkAndAwardBadges(payload, userId)
}

export async function onReviewDeleted(payload: any, doc: any) {
    const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user
    if (userId) {
        await updateUserReputation(payload, userId)
    }
}

export async function onFavoriteChanged(payload: any, userId: string | number) {
    if (userId) {
        await updateUserReputation(payload, userId)
    }
}
