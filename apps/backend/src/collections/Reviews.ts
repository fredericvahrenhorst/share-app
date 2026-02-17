import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload'

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (req?.user?.id && !data.user) {
    data.user = req.user.id
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
  return doc
}

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const locationId = typeof doc.location === 'object' ? doc.location.id : doc.location
  await updateLocationStats(req, locationId)
  return doc
}

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