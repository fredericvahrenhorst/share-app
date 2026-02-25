import type { Endpoint } from 'payload'

const apiDocumentation = {
    title: 'ShareApp API Documentation',
    version: '1.0.0',
    description: 'REST API für die ShareApp – Community-basierte Standort-Sharing-Plattform',
    collections: {
        locations: {
            path: '/api/locations',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Standorte verwalten (CRUD)',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: [
                'name',
                'description',
                'category',
                'coordinates',
                'address',
                'images',
                'openingHours',
                'rules',
                'tags',
                'accessibility',
                'contact',
                'status',
                'createdBy',
                'verified',
                'averageRating',
                'reviewCount',
                'confirmationCount',
            ],
        },
        categories: {
            path: '/api/categories',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Kategorien für Standorte',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['name', 'description', 'icon', 'color', 'isActive', 'sortOrder'],
        },
        users: {
            path: '/api/users',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Benutzerverwaltung mit Authentifizierung',
            auth: {
                read: false,
                create: false,
                update: true,
                delete: true,
            },
            fields: [
                'email',
                'name',
                'avatar',
                'bio',
                'location',
                'badges',
                'preferences',
                'reputation',
                'reputationLevel',
                'stats',
                'roles',
            ],
        },
        reviews: {
            path: '/api/reviews',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Bewertungen für Standorte',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['location', 'user', 'rating', 'comment', 'status', 'upvotes', 'downvotes'],
        },
        favorites: {
            path: '/api/favorites',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Benutzer-Favoriten',
            auth: {
                read: true,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['user', 'location'],
        },
        reports: {
            path: '/api/reports',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Meldungen für problematische Standorte',
            auth: {
                read: true,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['location', 'reportedBy', 'reason', 'description', 'status', 'adminNotes'],
        },
        'review-votes': {
            path: '/api/review-votes',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Abstimmungen für Bewertungen (hilfreich/nicht hilfreich)',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['review', 'user', 'type'],
        },
        'location-confirmations': {
            path: '/api/location-confirmations',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Bestätigungen für Standorte durch Community-Mitglieder',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['location', 'user', 'comment'],
        },
        activities: {
            path: '/api/activities',
            methods: ['GET'],
            description: 'Aktivitäts-Feed der Community',
            auth: {
                read: true,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['type', 'actor', 'location', 'review', 'metadata'],
        },
        'status-comments': {
            path: '/api/status-comments',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: 'Status-Kommentare für Standorte',
            auth: {
                read: false,
                create: true,
                update: true,
                delete: true,
            },
            fields: ['location', 'user', 'message', 'type'],
        },
    },
    customEndpoints: {
        search: {
            path: '/api/search/locations',
            method: 'GET',
            description: 'Suche nach Standorten mit Filtern',
            auth: false,
            queryParams: {
                query: 'Suchbegriff (optional)',
                category: 'Kategorie-ID oder "all" (optional)',
                page: 'Seitennummer (Standard: 1)',
                limit: 'Ergebnisse pro Seite (Standard: 20)',
            },
        },
        nearby: {
            path: '/api/search/locations/nearby',
            method: 'GET',
            description: 'Standorte in der Nähe finden',
            auth: false,
            queryParams: {
                latitude: 'Breitengrad (erforderlich)',
                longitude: 'Längengrad (erforderlich)',
                radius: 'Radius in km (Standard: 10)',
                category: 'Kategorie-Filter (optional)',
            },
        },
        communityFeed: {
            path: '/api/community/feed',
            method: 'GET',
            description: 'Community-Aktivitäts-Feed',
            auth: false,
            queryParams: {
                page: 'Seitennummer (Standard: 1)',
                limit: 'Ergebnisse pro Seite (Standard: 20, max: 50)',
            },
        },
        exportData: {
            path: '/api/users/export-data',
            method: 'GET',
            description: 'Alle Benutzerdaten exportieren (DSGVO Art. 20)',
            auth: true,
            queryParams: {},
        },
        bulkImport: {
            path: '/api/admin/bulk-import',
            method: 'POST',
            description: 'Standorte in Masse importieren (nur Admin)',
            auth: true,
            body: {
                locations:
                    'Array von Standort-Objekten mit mindestens name und coordinates',
            },
        },
        tagSearch: {
            path: '/api/search/tags',
            method: 'GET',
            description: 'Tags suchen oder populäre Tags abrufen',
            auth: false,
            queryParams: {
                q: 'Suchbegriff (optional, ohne: populäre Tags)',
            },
        },
    },
    authentication: {
        login: {
            path: '/api/users/login',
            method: 'POST',
            description: 'Benutzer-Anmeldung',
            body: { email: 'string', password: 'string' },
        },
        logout: {
            path: '/api/users/logout',
            method: 'POST',
            description: 'Benutzer-Abmeldung',
        },
        me: {
            path: '/api/users/me',
            method: 'GET',
            description: 'Aktuellen Benutzer abrufen',
        },
        forgotPassword: {
            path: '/api/users/forgot-password',
            method: 'POST',
            description: 'Passwort-Reset anfordern',
            body: { email: 'string' },
        },
        resetPassword: {
            path: '/api/users/reset-password',
            method: 'POST',
            description: 'Passwort zurücksetzen',
            body: { token: 'string', password: 'string' },
        },
    },
}

export const apiDocsEndpoint: Endpoint = {
    path: '/docs',
    method: 'get',
    handler: async () => {
        return Response.json(apiDocumentation)
    },
}
