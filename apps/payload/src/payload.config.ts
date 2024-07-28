import path from 'path'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'

import elements from './fields/richText/elements'
import leaves from './fields/richText/leaves'

import Users from './collections/Users'
import Pages from './collections/Pages'
import Media from './collections/Media'

import { Settings } from './globals/Settings'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({
    admin: {
      elements: [...elements],
      leaves: [...leaves],
    }
  }),
  collections: [
    Pages,
    Media,
    Users,
  ],
  globals: [
    Settings,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: ['http://localhost:5173'],
  upload: {
    limits: {
      fileSize: 20000000,
    },
  },
  plugins: [
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
})

