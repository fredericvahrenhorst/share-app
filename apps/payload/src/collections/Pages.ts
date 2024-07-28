import { CollectionConfig } from 'payload/types'
import { slugField } from '../fields/slug'

import { CallToAction } from '../blocks/CallToAction'
import { Content } from '../blocks/Content'

import { anyone } from '../access/anyone'


const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
      singular: {
          de: 'Seite',
          en: 'Page',
      },
      plural: {
          de: 'Seiten',
          en: 'Pages',
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
          description: 'Hier kannst du den Inhalt deiner Seite bearbeiten.',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                  position: 'sidebar'
              }
            },
            {
              name: 'blocks', // required
              label: 'Blöcke', // optional
              type: 'blocks', // required
              blocks: [
                CallToAction,
                Content,
              ],
            },
          ],
        },
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

export default Pages
