import type { CollectionConfig } from 'payload'
import { adminOnlyFieldUpdate, isAdmin, isAdminOrSelf } from '../accessControl'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => {
        const resetPasswordURL = `${process.env.FRONTEND_URL || '[REDACTED]'}/reset-password?token=${token}`

        return `
            <h1>Passwort zurücksetzen</h1>
            <p>Hallo ${user.name || 'Nutzer'},</p>
            <p>du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
            <p><a href="${resetPasswordURL}">${resetPasswordURL}</a></p>
            <p>Dieser Link ist 1 Stunde gültig.</p>
            <p>Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
        `
      },
      generateEmailSubject: () => 'Passwort zurücksetzen - ShareApp',
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      access: {
        create: () => false,
        update: adminOnlyFieldUpdate,
      },
    },
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
      access: {
        create: adminOnlyFieldUpdate,
        update: adminOnlyFieldUpdate,
      },
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
      name: 'reputation',
      type: 'number',
      label: 'Reputation',
      defaultValue: 0,
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'reputationLevel',
      type: 'select',
      label: 'Reputations-Level',
      defaultValue: 'newcomer',
      options: [
        { label: 'Neuling', value: 'newcomer' },
        { label: 'Aktiver Teiler', value: 'active' },
        { label: 'Community-Held', value: 'hero' },
        { label: 'Legende', value: 'legend' },
      ],
      admin: { readOnly: true },
      access: { update: adminOnlyFieldUpdate },
    },
    {
      name: 'stats',
      type: 'group',
      label: 'Statistiken',
      access: {
        update: adminOnlyFieldUpdate,
      },
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
        return data;
      },
    ],
  },
}
