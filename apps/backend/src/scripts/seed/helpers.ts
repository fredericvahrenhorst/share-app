import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
import { getPayload, type Payload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const backendRoot = path.resolve(dirname, '../../..')

dotenv.config({ path: path.resolve(backendRoot, '.env') })

export const DEMO_IMAGE_PATH = path.resolve(
    dirname,
    '../fixtures/demo-resource.png',
)

export const SEED_MEDIA_ALT = 'seed:demo-resource'

const WIPE_COLLECTIONS = [
    'review-votes',
    'status-comments',
    'location-confirmations',
    'reports',
    'favorites',
    'reviews',
    'activities',
    'locations',
    'categories',
] as const

export async function initPayload(): Promise<Payload> {
    const configModule = await import('../../payload.config')
    const config = configModule.default
    return getPayload({ config })
}

/** Minimal Lexical rich-text document for Payload. */
export function lexicalParagraph(text: string) {
    return {
        root: {
            type: 'root',
            format: '' as const,
            indent: 0,
            version: 1,
            direction: 'ltr' as const,
            children: [
                {
                    type: 'paragraph',
                    format: '' as const,
                    indent: 0,
                    version: 1,
                    direction: 'ltr' as const,
                    textFormat: 0,
                    children: [
                        {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal' as const,
                            style: '',
                            text,
                            version: 1,
                        },
                    ],
                },
            ],
        },
    }
}

export async function deleteAllDocs(
    payload: Payload,
    collection: string,
): Promise<number> {
    let deleted = 0
    // Paginate until empty (hooks may cascade)
    for (let i = 0; i < 100; i += 1) {
        const result = await payload.find({
            collection: collection as any,
            limit: 100,
            depth: 0,
            overrideAccess: true,
        })
        if (!result.docs.length) break
        for (const doc of result.docs) {
            await payload.delete({
                collection: collection as any,
                id: doc.id,
                overrideAccess: true,
            })
            deleted += 1
        }
    }
    return deleted
}

export async function wipeSeedData(payload: Payload): Promise<Record<string, number>> {
    const counts: Record<string, number> = {}
    for (const collection of WIPE_COLLECTIONS) {
        counts[collection] = await deleteAllDocs(payload, collection)
        console.log(`  wiped ${collection}: ${counts[collection]}`)
    }

    // Remove media tagged as seed fixtures
    let mediaDeleted = 0
    const seedMedia = await payload.find({
        collection: 'media',
        where: {
            alt: {
                like: 'seed:',
            },
        },
        limit: 100,
        depth: 0,
        overrideAccess: true,
    })
    for (const doc of seedMedia.docs) {
        await payload.delete({
            collection: 'media',
            id: doc.id,
            overrideAccess: true,
        })
        mediaDeleted += 1
    }
    counts.media = mediaDeleted
    console.log(`  wiped seed media: ${mediaDeleted}`)

    return counts
}

export async function uploadDemoMedia(payload: Payload): Promise<string> {
    if (!fs.existsSync(DEMO_IMAGE_PATH)) {
        throw new Error(`Demo-Bild fehlt: ${DEMO_IMAGE_PATH}`)
    }

    const media = await payload.create({
        collection: 'media',
        data: {
            alt: SEED_MEDIA_ALT,
        },
        filePath: DEMO_IMAGE_PATH,
        overrideAccess: true,
    })

    return String(media.id)
}

export type SeedUserInput = {
    email: string
    password: string
    name: string
    roles: ('admin' | 'user')[]
    bio?: string
    city?: string
    country?: string
    notifications?: boolean
    privacy?: 'public' | 'friends' | 'private'
}

export async function upsertUser(
    payload: Payload,
    input: SeedUserInput,
    avatarId?: string,
): Promise<string> {
    const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: input.email } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
    })

    const data: Record<string, unknown> = {
        email: input.email,
        password: input.password,
        name: input.name,
        roles: input.roles,
        bio: input.bio || '',
        location: {
            city: input.city || 'Bremen',
            country: input.country || 'Deutschland',
        },
        preferences: {
            notifications: input.notifications ?? true,
            privacy: input.privacy || 'public',
        },
    }

    if (avatarId) {
        data.avatar = avatarId
    }

    if (existing.docs[0]) {
        const updated = await payload.update({
            collection: 'users',
            id: existing.docs[0].id,
            data,
            overrideAccess: true,
        })
        return String(updated.id)
    }

    const created = await payload.create({
        collection: 'users',
        data,
        overrideAccess: true,
    })
    return String(created.id)
}
