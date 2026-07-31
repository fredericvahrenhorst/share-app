/**
 * Idempotent Resource-Sharing Seed (Payload Local API).
 *
 * Voraussetzung: MongoDB + apps/backend/.env (DATABASE_URI, PAYLOAD_SECRET)
 * Aufruf: pnpm --filter ./apps/backend seed
 * Nur Wipe: pnpm --filter ./apps/backend seed -- --wipe-only
 */

import type { Payload } from 'payload'

import {
    REVIEW_COMMENTS,
    SEED_CATEGORIES,
    SEED_LOCATIONS,
    SEED_USERS,
    STATUS_MESSAGES,
    type LocationSeed,
} from './seed/data'
import {
    initPayload,
    lexicalParagraph,
    uploadDemoMedia,
    upsertUser,
    wipeSeedData,
} from './seed/helpers'

const COMMUNITY_EMAILS = SEED_USERS.filter((u) => u.roles.length === 1 && u.roles[0] === 'user').map(
    (u) => u.email,
)

function pickReview(index: number) {
    return REVIEW_COMMENTS[index % REVIEW_COMMENTS.length]
}

function otherUsers(excludeEmail: string, count: number, offset = 0): string[] {
    const pool = COMMUNITY_EMAILS.filter((e) => e !== excludeEmail)
    if (!pool.length) return []
    const result: string[] = []
    for (let i = 0; i < count; i += 1) {
        result.push(pool[(offset + i) % pool.length])
    }
    return result
}

async function createCategories(
    payload: Payload,
): Promise<Record<string, string>> {
    const map: Record<string, string> = {}
    for (const cat of SEED_CATEGORIES) {
        const doc = await payload.create({
            collection: 'categories',
            data: {
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
                color: cat.color,
                sortOrder: cat.sortOrder,
                isActive: true,
            },
            overrideAccess: true,
        })
        map[cat.key] = String(doc.id)
        console.log(`  category: ${cat.name}`)
    }
    return map
}

async function createLocation(
    payload: Payload,
    loc: LocationSeed,
    categoryId: string,
    creatorId: string,
    mediaId: string,
): Promise<string> {
    const openingHours = loc.openingHours.is24_7
        ? { is24_7: true, schedule: [] }
        : { is24_7: false, schedule: loc.openingHours.schedule }

    const doc = await payload.create({
        collection: 'locations',
        data: {
            name: loc.name,
            description: lexicalParagraph(loc.description),
            category: categoryId,
            coordinates: loc.coordinates,
            address: loc.address,
            images: [{ image: mediaId }],
            openingHours,
            rules: loc.rules,
            tags: loc.tags.map((tag) => ({ tag })),
            accessibility: loc.accessibility,
            contact: loc.contact,
            status: loc.status,
            createdBy: creatorId,
            verified: loc.verified,
        },
        overrideAccess: true,
    })

    return String(doc.id)
}

async function seedSocial(
    payload: Payload,
    locationId: string,
    loc: LocationSeed,
    userIdsByEmail: Record<string, string>,
    locationIndex: number,
): Promise<{
    reviews: number
    favorites: number
    statusComments: number
    confirmations: number
    votes: number
    reports: number
}> {
    const counts = {
        reviews: 0,
        favorites: 0,
        statusComments: 0,
        confirmations: 0,
        votes: 0,
        reports: 0,
    }

    const creatorEmail = loc.creatorEmail
    const reviewAuthors = otherUsers(creatorEmail, 2 + (locationIndex % 3), locationIndex)
    const reviewIds: string[] = []

    for (let i = 0; i < reviewAuthors.length; i += 1) {
        const authorEmail = reviewAuthors[i]
        const template = pickReview(locationIndex * 3 + i)
        const review = await payload.create({
            collection: 'reviews',
            data: {
                location: locationId,
                user: userIdsByEmail[authorEmail],
                rating: template.rating,
                comment: template.comment,
                status: 'active',
            },
            overrideAccess: true,
        })
        reviewIds.push(String(review.id))
        counts.reviews += 1
    }

    // Review votes from other users
    for (let i = 0; i < reviewIds.length; i += 1) {
        const voters = otherUsers(reviewAuthors[i], 2, locationIndex + i + 1)
        for (let v = 0; v < voters.length; v += 1) {
            await payload.create({
                collection: 'review-votes',
                data: {
                    review: reviewIds[i],
                    user: userIdsByEmail[voters[v]],
                    type: v % 3 === 0 ? 'down' : 'up',
                },
                overrideAccess: true,
            })
            counts.votes += 1
        }
    }

    // Favorites
    const favUsers = otherUsers(creatorEmail, 2 + (locationIndex % 2), locationIndex + 2)
    for (const email of favUsers) {
        await payload.create({
            collection: 'favorites',
            data: {
                user: userIdsByEmail[email],
                location: locationId,
            },
            overrideAccess: true,
        })
        counts.favorites += 1
    }

    // Status comments
    const statusCount = 1 + (locationIndex % 2)
    for (let i = 0; i < statusCount; i += 1) {
        const msg = STATUS_MESSAGES[(locationIndex + i) % STATUS_MESSAGES.length]
        const author = otherUsers(creatorEmail, 1, locationIndex + i)[0] || creatorEmail
        await payload.create({
            collection: 'status-comments',
            data: {
                location: locationId,
                user: userIdsByEmail[author],
                message: msg.message,
                type: msg.type,
            },
            overrideAccess: true,
        })
        counts.statusComments += 1
    }

    // Confirmations (pending locations need ≥3 for verification hook)
    const confirmCount = loc.needsConfirmations ? 3 : locationIndex % 2 === 0 ? 2 : 1
    const confirmers = otherUsers(creatorEmail, confirmCount, locationIndex + 4)
    for (const email of confirmers) {
        await payload.create({
            collection: 'location-confirmations',
            data: {
                location: locationId,
                user: userIdsByEmail[email],
                comment: 'Standort geprüft und bestätigt.',
            },
            overrideAccess: true,
        })
        counts.confirmations += 1
    }

    // Sparse reports
    if (locationIndex % 8 === 3) {
        const reporter = otherUsers(creatorEmail, 1, 0)[0]
        await payload.create({
            collection: 'reports',
            data: {
                location: locationId,
                reportedBy: userIdsByEmail[reporter],
                reason: locationIndex % 16 === 3 ? 'false_info' : 'not_existing',
                description: 'Seed-Meldung zur Prüfung des Report-Flows.',
                status: 'open',
            },
            overrideAccess: true,
        })
        counts.reports += 1
    }

    return counts
}

async function run(): Promise<void> {
    const wipeOnly = process.argv.includes('--wipe-only')
    console.log('🌱 ShareApp Resource-Sharing Seed')
    console.log(wipeOnly ? 'Modus: nur Wipe' : 'Modus: Wipe + Neuaufbau')

    const payload = await initPayload()

    console.log('\n1) Wipe abhängiger Collections…')
    await wipeSeedData(payload)

    if (wipeOnly) {
        console.log('\n✅ Wipe abgeschlossen (--wipe-only).')
        process.exit(0)
    }

    console.log('\n2) Demo-Media hochladen…')
    const mediaId = await uploadDemoMedia(payload)
    console.log(`  media id: ${mediaId}`)

    console.log('\n3) User upserten…')
    const userIdsByEmail: Record<string, string> = {}
    for (const user of SEED_USERS) {
        const id = await upsertUser(payload, user, mediaId)
        userIdsByEmail[user.email] = id
        console.log(`  user: ${user.email} (${user.roles.join(',')})`)
    }

    console.log('\n4) Kategorien anlegen…')
    const categoryIds = await createCategories(payload)

    console.log('\n5) Locations + Community-Daten…')
    const totals = {
        locations: 0,
        reviews: 0,
        favorites: 0,
        statusComments: 0,
        confirmations: 0,
        votes: 0,
        reports: 0,
    }

    for (let i = 0; i < SEED_LOCATIONS.length; i += 1) {
        const loc = SEED_LOCATIONS[i]
        const categoryId = categoryIds[loc.categoryKey]
        const creatorId = userIdsByEmail[loc.creatorEmail]
        if (!categoryId || !creatorId) {
            throw new Error(`Fehlende Kategorie/Creator für ${loc.key}`)
        }

        const locationId = await createLocation(
            payload,
            loc,
            categoryId,
            creatorId,
            mediaId,
        )
        totals.locations += 1

        const social = await seedSocial(payload, locationId, loc, userIdsByEmail, i)
        totals.reviews += social.reviews
        totals.favorites += social.favorites
        totals.statusComments += social.statusComments
        totals.confirmations += social.confirmations
        totals.votes += social.votes
        totals.reports += social.reports

        console.log(`  location: ${loc.name}`)
    }

    console.log('\n✅ Seed fertig')
    console.log(JSON.stringify(totals, null, 2))
    console.log('\nLogin-Accounts:')
    console.log('  test@example.com / test123  (admin)')
    console.log('  admin@shareapp.local / admin123  (admin)')
    console.log('  anna@shareapp.local / demo1234  (user)')

    process.exit(0)
}

run().catch((error) => {
    console.error('❌ Seed fehlgeschlagen:', error)
    process.exit(1)
})
