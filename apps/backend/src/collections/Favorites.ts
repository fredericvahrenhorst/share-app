import type { CollectionConfig } from 'payload'

import { adminOnlyFieldUpdate, isAdmin, isAdminOrOwner, isAuthenticated } from '../accessControl'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req }) => {
      if (isAdmin({ req })) return true
      if (!req?.user) return false
      return { user: { equals: req.user.id } }
    },
    create: isAuthenticated,
    update: isAdminOrOwner('favorites', 'user'),
    delete: isAdminOrOwner('favorites', 'user'),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Benutzer',
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      required: true,
      label: 'Standort',
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