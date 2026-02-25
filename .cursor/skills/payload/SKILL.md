# Payload CMS Skill

Use when working with Payload CMS in this project or in general: `payload.config.ts`, collections, fields, hooks, access control, Payload Local/REST API. Use when debugging validation errors, security issues, relationship queries, transactions, or hook behavior.

---

## When to Use

- Editing or adding **collections** (e.g. `apps/backend/src/collections/*.ts`)
- Configuring **fields** (text, relationship, upload, select, array, blocks, point, conditional, validation)
- Implementing **hooks** (beforeChange, afterChange, beforeDelete, afterRead)
- **Access control** (collection/field access, row-level security, `overrideAccess`)
- **Custom endpoints** (e.g. `apps/backend/src/endpoints/locations.ts`, `search.ts`)
- **Queries**: Local API, REST, depth, where, sort, select
- **Security**: Local API + user + `overrideAccess: false`, transactions in hooks, avoiding hook loops
- **Admin UI**: `admin.condition`, `type: 'row'`, `admin.width`, labels

---

## In This Project (ShareApp)

- **Config**: `apps/backend/src/payload.config.ts`
- **Collections**: `Users`, `Media`, `Categories`, `Locations`, `Reviews`, `Favorites`, `Reports`
- **DB**: MongoDB (`mongooseAdapter`), `payload-types.ts` generated
- **Custom endpoints**: `locationsEndpoint`, `searchEndpoint` (registered in config)
- **Conventions**: Collections PascalCase, slugs kebab-case; use `type: 'row'` and `admin.condition` for Admin UI; reusable field helpers for links/buttons/uploads.

---

## Quick Reference

| Task | Solution | Details |
|------|----------|---------|
| Auto-generate slugs | `slugField()` | FIELDS.md#slug-field-helper |
| Restrict content by user | Access control with query | ACCESS-CONTROL.md#row-level-security-with-complex-queries |
| Local API user ops | `user` + `overrideAccess: false` | QUERIES.md#access-control-in-local-api |
| Draft/publish workflow | `versions: { drafts: true }` | COLLECTIONS.md#versioning--drafts |
| Computed fields | `virtual: true` with `afterRead` | FIELDS.md#virtual-fields |
| Conditional fields | `admin.condition` | FIELDS.md#conditional-fields |
| Custom field validation | `validate` function | FIELDS.md#validation |
| Filter relationship list | `filterOptions` on field | FIELDS.md#relationship |
| Select specific fields | `select` parameter | QUERIES.md#field-selection |
| Auto-set author/dates | `beforeChange` hook | HOOKS.md#collection-hooks |
| Prevent hook loops | `req.context` check | HOOKS.md#context |
| Cascading deletes | `beforeDelete` hook | HOOKS.md#collection-hooks |
| Geospatial queries | `point` field with `near`/`within` | FIELDS.md#point-geolocation |
| Reverse relationships | `join` field type | FIELDS.md#join-fields |
| Next.js revalidation | Context in `afterChange` | HOOKS.md#nextjs-revalidation-with-context-control |
| Query by relationship | Nested property syntax | QUERIES.md#nested-properties |
| Complex queries | AND/OR logic | QUERIES.md#andor-logic |
| Transactions | Pass `req` to operations | ADAPTERS.md#threading-req-through-operations |
| Background jobs | Jobs queue with tasks | ADVANCED.md#jobs-queue |
| Custom API routes | Collection custom endpoints | ADVANCED.md#custom-endpoints |
| Cloud storage | Storage adapter plugins | ADAPTERS.md#storage-adapters |
| Multi-language | localization config + `localized: true` | ADVANCED.md#localization |
| Create plugin | `(options) => (config) => Config` | PLUGIN-DEVELOPMENT.md#plugin-architecture |

---

## Minimal Config (MongoDB)

```ts
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: 'users', importMap: { baseDir: path.resolve(dirname) } },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URI }),
})
```

---

## Essential Patterns

### Basic Collection

```ts
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

### Common Fields

```ts
// Text
{ name: 'title', type: 'text', required: true }

// Relationship
{ name: 'author', type: 'relationship', relationTo: 'users', required: true }

// Rich text
{ name: 'content', type: 'richText', required: true }

// Select
{ name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' }

// Upload
{ name: 'image', type: 'upload', relationTo: 'media' }

// Row layout (Admin UI)
{
  type: 'row',
  fields: [
    { name: 'lat', type: 'number', admin: { width: '50%' } },
    { name: 'lng', type: 'number', admin: { width: '50%' } },
  ],
}

// Conditional field
{
  name: 'extra',
  type: 'text',
  admin: { condition: (data, siblingData) => siblingData?.variant === 'full' },
}
```

### Hook Example (slug + prevent loops)

```ts
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && data?.title) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.skipHooks) return
        // Side effect; pass req for same transaction if doing payload.create/update
        await req.payload.update({
          collection: 'posts',
          id: doc.id,
          data: { updatedAt: new Date().toISOString() },
          context: { skipHooks: true },
          req,
        })
      },
    ],
  },
  fields: [{ name: 'title', type: 'text' }, { name: 'slug', type: 'text' }],
}
```

### Access Control (type-safe)

```ts
import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const adminOnly: Access = ({ req }) => {
  const user = req.user as User
  return user?.roles?.includes('admin') || false
}

export const ownPostsOnly: Access = ({ req }) => {
  const user = req.user as User
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return { author: { equals: user.id } }
}
```

### Queries (Local API)

```ts
// Enforce access control when acting on behalf of a user
const posts = await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // required for access control
  where: {
    status: { equals: 'published' },
    'author.name': { contains: 'john' },
  },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
})

const post = await payload.findByID({
  collection: 'posts',
  id: '123',
  depth: 2,
})
```

### Getting Payload Instance

```ts
// API routes / Server Components (Next.js)
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'posts' })
```

---

## Security Pitfalls

### 1. Local API access control (critical)

By default, Local API **bypasses** access control even when `user` is set.

```ts
// ❌ BUG: access control still bypassed
await payload.find({ collection: 'posts', user: someUser })

// ✅ Enforce user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false,
})
```

- `overrideAccess: true` (default): trusted server tasks (cron, system).
- `overrideAccess: false`: when acting on behalf of a user (API routes, webhooks).

### 2. Transactions in hooks

Nested operations must receive `req` so they run in the same transaction.

```ts
// ❌ Separate transaction
afterChange: [
  async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      // missing req → separate transaction
    })
  },
]

// ✅ Same transaction
afterChange: [
  async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      req,
    })
  },
]
```

### 3. Infinite hook loops

Use `context` to skip hooks when a hook triggers the same collection.

```ts
// ❌ Loop: afterChange → update → afterChange → …
afterChange: [
  async ({ doc, req }) => {
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { views: (doc.views ?? 0) + 1 },
      req,
    })
  },
]

// ✅ Guard with context
afterChange: [
  async ({ doc, req, context }) => {
    if (context?.skipHooks) return
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { views: (doc.views ?? 0) + 1 },
      context: { skipHooks: true },
      req,
    })
  },
]
```

---

## Project Structure (Payload app)

```
src/
├── app/(payload)/admin/[[...segments]]/page.tsx
├── collections/
│   ├── Posts.ts
│   ├── Media.ts
│   └── Users.ts
├── globals/
├── endpoints/          # custom endpoints
├── payload.config.ts
└── payload-types.ts    # generated
```

---

## Type Generation

```ts
// payload.config.ts
typescript: {
  outputFile: path.resolve(dirname, 'payload-types.ts'),
}

// Usage
import type { Post, User, Location } from '@/payload-types'
```

---

## Reference Docs (payloadcms.com)

- **FIELDS.md** – Field types, validation, admin, conditional, virtual, point, relationship
- **COLLECTIONS.md** – Auth, upload, drafts, live preview
- **HOOKS.md** – Collection/field hooks, context
- **ACCESS-CONTROL.md** – Collection/field/global access, RBAC
- **QUERIES.md** – Operators, Local/REST/GraphQL, depth, select
- **ENDPOINTS.md** – Custom endpoints
- **ADAPTERS.md** – DB, storage, transactions
- **ADVANCED.md** – Auth, jobs, plugins, localization
- **PLUGIN-DEVELOPMENT.md** – Plugin API, adding fields/hooks

**Resources:** [Docs](https://payloadcms.com/docs) · [GitHub](https://github.com/payloadcms/payload) · [Examples](https://github.com/payloadcms/payload/tree/main/examples) · [llms-full.txt](https://payloadcms.com/llms-full.txt)
