import type { CollectionConfig } from 'payload'

import { isAdminOrOwner, isAuthenticated } from '../accessControl'

export const StatusComments: CollectionConfig = {
    slug: 'status-comments',
    admin: {
        useAsTitle: 'message',
    },
    timestamps: true,
    access: {
        read: () => true,
        create: isAuthenticated,
        update: isAdminOrOwner('status-comments', 'user'),
        delete: isAdminOrOwner('status-comments', 'user'),
    },
    hooks: {
        beforeChange: [
            async ({ data, req }) => {
                if (req?.user?.id && !data.user) {
                    data.user = req.user.id
                }
                return data
            },
        ],
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
            name: 'message',
            type: 'text',
            required: true,
            maxLength: 200,
            label: 'Nachricht',
        },
        {
            name: 'type',
            type: 'select',
            label: 'Typ',
            options: [
                { label: 'Status Update', value: 'status_update' },
                { label: 'Info', value: 'info' },
                { label: 'Warnung', value: 'warning' },
            ],
            defaultValue: 'status_update',
        },
    ],
}
