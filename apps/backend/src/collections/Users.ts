import type { CollectionConfig } from 'payload'
import { greet, User } from '@test/shared';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user) {
        return true
      }
      return false
    },
    delete: ({ req: { user } }) => {
      // Nur Admins können User löschen
      return Boolean(user)
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profilbild',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Über mich',
    },
    {
      name: 'location',
      type: 'group',
      label: 'Standort',
      fields: [
        {
          name: 'city',
          type: 'text',
          label: 'Stadt',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Land',
        },
      ],
    },
    {
      name: 'badges',
      type: 'array',
      label: 'Badges',
      fields: [
        {
          name: 'badge',
          type: 'select',
          options: [
            { label: 'Ersteller', value: 'creator' },
            { label: 'Verifiziert', value: 'verified' },
            { label: 'Community-Helfer', value: 'helper' },
            { label: 'Moderator', value: 'moderator' },
          ],
        },
        {
          name: 'earnedAt',
          type: 'date',
          label: 'Erhalten am',
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      label: 'Einstellungen',
      fields: [
        {
          name: 'notifications',
          type: 'checkbox',
          label: 'E-Mail-Benachrichtigungen',
          defaultValue: true,
        },
        {
          name: 'privacy',
          type: 'select',
          label: 'Privatsphäre',
          options: [
            { label: 'Öffentlich', value: 'public' },
            { label: 'Nur Freunde', value: 'friends' },
            { label: 'Privat', value: 'private' },
          ],
          defaultValue: 'public',
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      label: 'Statistiken',
      fields: [
        {
          name: 'locationsCreated',
          type: 'number',
          label: 'Erstellte Standorte',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'reviewsWritten',
          type: 'number',
          label: 'Geschriebene Bewertungen',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'favoritesCount',
          type: 'number',
          label: 'Favoriten',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        console.log(greet(data.name)); // Nutzt die Shared-Utility
        return data;
      },
    ],
  },
}
