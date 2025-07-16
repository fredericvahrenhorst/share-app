// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Locations } from './collections/Locations'
import { Reviews } from './collections/Reviews'
import { Favorites } from './collections/Favorites'
import { Reports } from './collections/Reports'

import { locationsEndpoint } from './endpoints/locations'
import { searchEndpoint } from './endpoints/search'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Locations,
    Reviews,
    Favorites,
    Reports
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:8100',
    'http://localhost:5173',
    'http://localhost:8100',
    'http://localhost:3000',
    'http://192.168.2.195:5173',
    'http://192.168.1.155:5173'
  ],
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:8100',
    'http://localhost:5173',
    'http://localhost:8100',
    'http://localhost:3000',
    'http://192.168.2.195:5173',
    'http://192.168.1.155:5173'
  ],
  endpoints: [
    {
      path: '/hello',
      method: 'get',
      handler: async (req) => {
        console.log(req);
        return Response.json({ message: 'Hallo Welt!' });
      },
    },
    locationsEndpoint,
    searchEndpoint
  ]
})
