import type { Block, Field } from 'payload/types'

import link from '../../fields/link'
import richText from '../../fields/richText'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: {
          de: 'Breite',
          en: 'Size',
    },
    defaultValue: 'oneThird',
    options: [
      {
        value: 'oneThird',
        label: {
            de: '1/3',
            en: '1/3',

        },
      },
      {
        value: 'half',
        label: {
            de: '1/2',
            en: '1/2',
        },
      },
      {
        value: 'twoThirds',
        label: {
            de: '2/3',
            en: '2/3',
        },
      },
      {
        value: 'full',
        label: {
            de: '1/1',
            en: '1/1',
        },
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    label: {
        de: 'WYSIWYG-Editor',
        en: 'Rich-text Editor',
    },
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_, { enableLink }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: {
          de: 'Spalten',
          en: 'Columns',
      },
      fields: columnFields,
    },
  ],
}
