import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Bewertung (1-5)',
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Kommentar',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Aktiv', value: 'active' },
        { label: 'Ausstehend', value: 'pending' },
        { label: 'Gesperrt', value: 'blocked' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Erstellt am',
      admin: {
        readOnly: true,
      },
    },
  ],
} 