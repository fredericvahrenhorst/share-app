import type { CollectionConfig } from 'payload'

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      required: true,
      label: 'Gemeldeter Standort',
    },
    {
      name: 'reportedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Gemeldet von',
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      label: 'Grund',
      options: [
        { label: 'Falsche Informationen', value: 'false_info' },
        { label: 'Nicht mehr existent', value: 'not_existing' },
        { label: 'Unangemessener Inhalt', value: 'inappropriate' },
        { label: 'Spam', value: 'spam' },
        { label: 'Sonstiges', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Offen', value: 'open' },
        { label: 'In Bearbeitung', value: 'in_progress' },
        { label: 'Gelöst', value: 'resolved' },
        { label: 'Abgelehnt', value: 'rejected' },
      ],
      defaultValue: 'open',
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notizen',
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