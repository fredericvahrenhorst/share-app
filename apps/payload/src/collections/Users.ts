import { CollectionConfig } from 'payload/types'

const Users: CollectionConfig = {
  slug: 'users',
  labels: {
      singular: {
          de: 'Benutzer',
          en: 'User',
      },
      plural: {
          de: 'Benutzer',
          en: 'Users',
      },
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: {
        de: 'Einstellungen',
        en: 'Settings',
    },
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}

export default Users
