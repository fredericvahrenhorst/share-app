import type { GlobalConfig } from 'payload/types'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: {
    de: 'Einstellungen',
    en: 'Settings',
  },
  typescript: {
    interface: 'Settings',
  },
  graphQL: {
    name: 'Settings',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: {
      de: 'Einstellungen',
      en: 'Settings',
    }
  },
  fields: [
    {
        type: 'row',
        fields: [
            {
                name: 'logo',
                label: {
                  de: 'Header-Logo',
                  en: 'Header Logo',
                },
                type: 'upload',
                relationTo: 'media',
                required: true,
                filterOptions: {
                    mimeType: { contains: 'svg' },
                },
                admin: {
                    width: '25%',
                    description: {
                      de: 'Muss eine SVG-Datei sein.',
                      en: 'Must be an SVG file.',
                    }
                },
            },
            {
              name: 'appName',
              type: 'text',
              label: {
                de: 'Globaler Appname',
                en: 'App Name',
              },
              admin: {
                description: {
                  de: 'Der Name der App, der an verschiedenen Stellen und im Browser-Titel angezeigt wird.',
                  en: 'The name of the app, displayed in various places and the browser title.',
                },
                width: '25%',
              }
            },
        ],
      },

  ],
}
