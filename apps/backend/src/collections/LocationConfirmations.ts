import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'

import { isAuthenticated, isAdminOrOwner } from '../accessControl'

const CONFIRMATIONS_THRESHOLD = 3

const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
    if (operation !== 'create') return doc

    const locationId = typeof doc.location === 'object' ? doc.location.id : doc.location
    if (!locationId) return doc

    const confirmations = await req.payload.find({
        collection: 'location-confirmations',
        where: { location: { equals: locationId } },
        limit: 0,
    })

    if (confirmations.totalDocs >= CONFIRMATIONS_THRESHOLD) {
        const location = await req.payload.findByID({
            collection: 'locations',
            id: locationId,
        })
        if (location?.status === 'pending') {
            await req.payload.update({
                collection: 'locations',
                id: locationId,
                data: { status: 'active', verified: true },
            })
            await req.payload.create({
                collection: 'activities',
                data: {
                    type: 'location_verified',
                    actor: typeof doc.user === 'object' ? doc.user.id : doc.user,
                    location: locationId,
                    metadata: { confirmationCount: confirmations.totalDocs },
                },
            })
        }
    }

    return doc
}

export const LocationConfirmations: CollectionConfig = {
    slug: 'location-confirmations',
    admin: {
        useAsTitle: 'id',
    },
    access: {
        read: () => true,
        create: isAuthenticated,
        update: isAdminOrOwner('location-confirmations', 'user'),
        delete: isAdminOrOwner('location-confirmations', 'user'),
    },
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                if (req?.user?.id && !data.user) {
                    data.user = req.user.id
                }
                if (operation === 'create' && req?.user?.id) {
                    const existing = await req.payload.find({
                        collection: 'location-confirmations',
                        where: {
                            location: { equals: data.location },
                            user: { equals: req.user.id },
                        },
                        limit: 1,
                    })
                    if (existing.totalDocs > 0) {
                        throw new Error('Du hast diesen Standort bereits bestätigt.')
                    }
                }
                return data
            },
        ],
        afterChange: [afterChangeHook],
    },
    fields: [
        {
            name: 'location',
            type: 'relationship',
            relationTo: 'locations',
            required: true,
            label: 'Standort',
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'Benutzer',
        },
        {
            name: 'comment',
            type: 'textarea',
            label: 'Kommentar',
        },
    ],
    timestamps: true,
}
