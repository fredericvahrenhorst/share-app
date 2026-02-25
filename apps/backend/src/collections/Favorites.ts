import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { adminOnlyFieldUpdate, isAdmin, isAdminOrOwner, isAuthenticated } from '../accessControl'
import { onFavoriteChanged } from '../hooks/communityHooks'

const favoriteAfterChangeHook: CollectionAfterChangeHook = async ({ doc, req }) => {
  const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user
  try { await onFavoriteChanged(req.payload, userId) } catch (e) { console.error('Community hook error (fav):', e) }
  return doc
}
const favoriteAfterDeleteHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user
  try { await onFavoriteChanged(req.payload, userId) } catch (e) { console.error('Community hook error (fav del):', e) }
  return doc
}

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
  hooks: {
    afterChange: [favoriteAfterChangeHook],
    afterDelete: [favoriteAfterDeleteHook],
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