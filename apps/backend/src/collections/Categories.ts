import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Kategorie Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon (Emoji oder Icon-Name)',
      defaultValue: '📦',
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farbe (Hex-Code)',
      defaultValue: '#3B82F6',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sortierreihenfolge',
      defaultValue: 0,
    },
  ],
} 