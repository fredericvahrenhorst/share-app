import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'

import { adminOnlyFieldUpdate, isAdmin, isAdminOrCreator, isAuthenticated } from '../accessControl'
import { onLocationCreated } from '../hooks/communityHooks'

const locationAfterChangeHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation === 'create') {
    try {
      await onLocationCreated(req.payload, doc)
    } catch (e) {
      console.error('Community hook error (location):', e)
    }
  }
  return doc
}

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAdminOrCreator('locations', 'createdBy'),
    delete: isAdmin,
  },
  hooks: {
    afterChange: [locationAfterChangeHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Standort Name',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Beschreibung',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Kategorie',
    },
    {
      name: 'coordinates',
      type: 'point',
      label: 'Koordinaten',
      required: true,
    },
    {
      name: 'address',
      type: 'group',
      label: 'Adresse',
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Straße & Hausnummer',
        },
        {
          name: 'city',
          type: 'text',
          label: 'Stadt',
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'PLZ',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Land',
          defaultValue: 'Deutschland',
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Bilder',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'openingHours',
      type: 'group',
      label: 'Öffnungszeiten',
      fields: [
        {
          name: 'is24_7',
          type: 'checkbox',
          label: '24/7 geöffnet',
          defaultValue: false,
        },
        {
          name: 'schedule',
          type: 'array',
          label: 'Wochenplan',
          fields: [
            {
              name: 'day',
              type: 'select',
              options: [
                { label: 'Montag', value: 'monday' },
                { label: 'Dienstag', value: 'tuesday' },
                { label: 'Mittwoch', value: 'wednesday' },
                { label: 'Donnerstag', value: 'thursday' },
                { label: 'Freitag', value: 'friday' },
                { label: 'Samstag', value: 'saturday' },
                { label: 'Sonntag', value: 'sunday' },
              ],
            },
            {
              name: 'open',
              type: 'text',
              label: 'Öffnet (HH:MM)',
            },
            {
              name: 'close',
              type: 'text',
              label: 'Schließt (HH:MM)',
            },
          ],
        },
      ],
    },
    {
      name: 'rules',
      type: 'textarea',
      label: 'Regeln / Hinweise',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'accessibility',
      type: 'group',
      label: 'Barrierefreiheit',
      fields: [
        {
          name: 'wheelchairAccessible',
          type: 'checkbox',
          label: 'Rollstuhlgerecht',
        },
        {
          name: 'accessibleToilet',
          type: 'checkbox',
          label: 'Behindertengerechtes WC',
        },
        {
          name: 'accessibleParking',
          type: 'checkbox',
          label: 'Behindertenparkplatz',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Kontakt',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
        },
        {
          name: 'email',
          type: 'email',
          label: 'E-Mail',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      access: { update: adminOnlyFieldUpdate },
      options: [
        { label: 'Aktiv', value: 'active' },
        { label: 'Inaktiv', value: 'inactive' },
        { label: 'In Bearbeitung', value: 'pending' },
        { label: 'Gesperrt', value: 'blocked' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Erstellt von',
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: 'Verifiziert',
      access: { update: adminOnlyFieldUpdate },
      defaultValue: false,
    },
    {
      name: 'averageRating',
      type: 'number',
      label: 'Durchschnittsbewertung',
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'reviewCount',
      type: 'number',
      label: 'Anzahl Bewertungen',
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
      defaultValue: 0,
    },
    {
      name: 'confirmationCount',
      type: 'number',
      label: 'Bestätigungen',
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
      defaultValue: 0,
    },
  ],
} 