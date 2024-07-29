import { CollectionConfig } from 'payload/types'
import { slugField } from '../fields/slug'

import { anyone } from '../access/anyone'

const Locations: CollectionConfig = {
  slug: 'locations',
  labels: {
      singular: {
          de: 'Ort',
          en: 'Location',
      },
      plural: {
          de: 'Orte',
          en: 'Locations',
      },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'id', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
  },
  versions: true,
  fields: [
    {
      type: 'tabs', // required
      tabs: [
        // required
        {
          label: 'Inhalt', // required
          description: {
            de: 'Hier kannst du den Inhalt deines Ortes bearbeiten.',
            en: 'Here you can edit the content of your location.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea'
            },
            {
                name: 'location',
                type: 'point',
                label: 'Location',
                required: true,
            },
          ],
        },
        {
            label: 'Bilder',
            description: {
              de: 'Hier kannst du Bilder hinzufügen.',
              en: 'Here you can add images.',
            },
            fields: [
                {
                    name: 'images',
                    type: 'array',
                    fields: [
                        {
                            name: 'image',
                            type: 'upload',
                            relationTo: 'media',
                            required: true,
                        },
                    ],
                },
            ]
        }
      ],
    },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
}

export default Locations
