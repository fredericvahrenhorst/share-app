import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload'

import { adminOnlyFieldUpdate, isAdminOrOwner, isAuthenticated } from '../accessControl'
import { onReviewCreated, onReviewDeleted } from '../hooks/communityHooks'
import { checkSpamContent } from '../hooks/spamDetection'

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (req?.user?.id && !data.user) {
    data.user = req.user.id
  }
  if (data.comment) {
    const { isSpam, reason } = checkSpamContent(data.comment)
    if (isSpam) {
      throw new Error(`Spam erkannt: ${reason}`)
    }
  }
  return data
}

const updateLocationStats = async (req: any, locationId: string | number) => {
  if (!locationId) return

  const reviews = await req.payload.find({
    collection: 'reviews',
    where: {
      location: {
        equals: locationId,
      },
      status: {
        equals: 'active',
      },
    },
    limit: 0,
  })

  const totalRating = reviews.docs.reduce((sum: number, review: any) => sum + (review.rating || 0), 0)
  const reviewCount = reviews.totalDocs
  const averageRating = reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(1)) : 0

  await req.payload.update({
    collection: 'locations',
    id: locationId,
    data: {
      averageRating,
      reviewCount,
    },
  })
}

const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const locationId = typeof doc.location === 'object' ? doc.location.id : doc.location
  await updateLocationStats(req, locationId)
  if (operation === 'create') {
    try {
      await onReviewCreated(req.payload, doc)
    } catch (e) {
      console.error('Community hook error (review create):', e)
    }
  }
  return doc
}

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const locationId = typeof doc.location === 'object' ? doc.location.id : doc.location
  await updateLocationStats(req, locationId)
  try {
    await onReviewDeleted(req.payload, doc)
  } catch (e) {
    console.error('Community hook error (review delete):', e)
  }
  return doc
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAdminOrOwner('reviews', 'user'),
    delete: isAdminOrOwner('reviews', 'user'),
  },
  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
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
      access: { update: adminOnlyFieldUpdate },
      options: [
        { label: 'Aktiv', value: 'active' },
        { label: 'Ausstehend', value: 'pending' },
        { label: 'Gesperrt', value: 'blocked' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'upvotes',
      type: 'number',
      label: 'Hilfreich',
      defaultValue: 0,
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'downvotes',
      type: 'number',
      label: 'Nicht hilfreich',
      defaultValue: 0,
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
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