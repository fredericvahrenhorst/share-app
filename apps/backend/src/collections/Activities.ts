import type { CollectionConfig } from 'payload'

import { isAdmin, isAuthenticated } from '../accessControl'

export const Activities: CollectionConfig = {
    slug: 'activities',
    admin: {
        useAsTitle: 'type',
    },
    access: {
        read: isAuthenticated,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
    },
    fields: [
        {
            name: 'type',
            type: 'select',
            required: true,
            label: 'Aktivitätstyp',
            options: [
                { label: 'Standort erstellt', value: 'location_created' },
                { label: 'Bewertung geschrieben', value: 'review_added' },
                { label: 'Standort verifiziert', value: 'location_verified' },
                { label: 'Badge erhalten', value: 'badge_earned' },
                { label: 'Standort bestätigt', value: 'location_confirmed' },
            ],
        },
        {
            name: 'actor',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'Akteur',
        },
        {
            name: 'location',
            type: 'relationship',
            relationTo: 'locations',
            label: 'Standort',
        },
        {
            name: 'review',
            type: 'relationship',
            relationTo: 'reviews',
            label: 'Bewertung',
        },
        {
            name: 'metadata',
            type: 'json',
            label: 'Zusätzliche Daten',
        },
    ],
    timestamps: true,
}
