// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { ReviewVotes } from './collections/ReviewVotes'
import { Activities } from './collections/Activities'
import { LocationConfirmations } from './collections/LocationConfirmations'
import { StatusComments } from './collections/StatusComments'

import { locationsEndpoint } from './endpoints/locations'
import { searchEndpoint } from './endpoints/search'
import { activityFeedEndpoint } from './endpoints/activityFeed'
import { exportDataEndpoint } from './endpoints/exportData'
import { tagSearchEndpoint } from './endpoints/tagSearch'
import { bulkImportEndpoint } from './endpoints/bulkImport'
import { apiDocsEndpoint } from './endpoints/apiDocs'
import { adminDashboardEndpoint } from './endpoints/adminDashboard'
import { deleteAccountEndpoint } from './endpoints/deleteAccount'

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
    Reports,
    ReviewVotes,
    Activities,
    LocationConfirmations,
    StatusComments,
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
    '[REDACTED]',
    'http://localhost:8100',
    'http://localhost:3000',
    '[REDACTED]',
    'http://192.168.1.155:5173',
    'http://192.168.2.195:5173',
  ],
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:8100',
    '[REDACTED]',
    'http://localhost:8100',
    'http://localhost:3000',
    '[REDACTED]',
    'http://192.168.1.155:5173',
    'http://192.168.2.195:5173',
  ],
  endpoints: [
    locationsEndpoint,
    searchEndpoint,
    activityFeedEndpoint,
    exportDataEndpoint,
    tagSearchEndpoint,
    bulkImportEndpoint,
    apiDocsEndpoint,
    adminDashboardEndpoint,
    deleteAccountEndpoint,
  ],
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'info@shareapp.local',
    defaultFromName: process.env.SMTP_FROM_NAME || 'ShareApp',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: Number(process.env.SMTP_PORT) === 465,
    },
  }),
})
