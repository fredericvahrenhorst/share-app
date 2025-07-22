# Project Structure

## Monorepo Organization

This is a Turborepo monorepo with the following structure:

```
├── apps/                    # Application packages
│   ├── frontend/           # Ionic Vue mobile app
│   └── backend/            # Payload CMS + Next.js API
├── packages/               # Shared packages
│   ├── shared/            # Common types and utilities
│   ├── ui/                # React component library
│   └── eslint-config/     # Shared ESLint configurations
└── [config files]         # Root configuration
```

## Frontend Structure (apps/frontend)

```
src/
├── components/             # Vue components
│   ├── LocationCard.vue
│   ├── LocationDetail.vue
│   ├── LocationMap.vue
│   ├── PageHeader.vue
│   ├── SearchModal.vue
│   └── SettingsModal.vue
├── composables/           # Vue composables
│   └── apiCall.js
├── css/                   # Global styles
│   ├── helper.css
│   ├── main.css
│   └── variables.css
├── locales/              # i18n translations
│   └── de.json
├── store/                # Pinia stores
│   ├── appStore.js
│   ├── locationsStore.js
│   └── userStore.js
├── views/                # Page components
│   ├── CategoriesPage.vue
│   ├── FavoritesPage.vue
│   ├── ProfilPage.vue
│   └── StartPage.vue
└── main.js               # App entry point
```

## Backend Structure (apps/backend)

```
src/
├── collections/          # Payload CMS collections
│   ├── Categories.ts
│   ├── Favorites.ts
│   ├── Locations.ts
│   ├── Media.ts
│   ├── Reports.ts
│   ├── Reviews.ts
│   └── Users.ts
├── endpoints/            # Custom API endpoints
│   ├── locations.ts
│   └── search.ts
├── middleware/           # Express middleware
│   └── rate-limit.ts
├── scripts/              # Utility scripts
│   └── seed-rest.ts
├── payload.config.ts     # Payload CMS configuration
└── payload-types.ts      # Generated TypeScript types
```

## Key Configuration Files

- **Root Level**:
  - `turbo.json` - Turborepo build configuration
  - `pnpm-workspace.yaml` - Workspace definition
  - `package.json` - Root package with shared scripts

- **Frontend**:
  - `capacitor.config.ts` - Mobile app configuration
  - `vite.config.js` - Build tool configuration
  - `ionic.config.json` - Ionic framework settings

- **Backend**:
  - `payload.config.ts` - CMS configuration and collections
  - `next.config.mjs` - Next.js configuration
  - `docker-compose.yml` - Local MongoDB setup

## Naming Conventions

### Files & Directories
- **Vue Components**: PascalCase (e.g., `LocationCard.vue`)
- **Payload Collections**: PascalCase (e.g., `Locations.ts`)
- **Stores**: camelCase with "Store" suffix (e.g., `locationsStore.js`)
- **Endpoints**: kebab-case (e.g., `locations.ts`)
- **CSS Files**: kebab-case (e.g., `helper.css`)

### Code Conventions
- **TypeScript**: Strict mode enabled
- **Vue**: Composition API preferred
- **Payload Collections**: Use descriptive German labels for admin UI
- **API Endpoints**: RESTful naming with `/api/` prefix

## Import Patterns

### Frontend
```typescript
// Vue components
import LocationCard from '@/components/LocationCard.vue'

// Stores
import { useLocationsStore } from '@/store/locationsStore'

// Shared utilities
import { greet } from 'shared'
```

### Backend
```typescript
// Payload types
import type { CollectionConfig } from 'payload'

// Shared utilities
import { User } from '@test/shared'

// Local modules
import { Users } from './collections/Users'
```

## Development Workflow

1. **New Features**: Create in appropriate app directory
2. **Shared Code**: Add to `packages/shared` for cross-app usage
3. **Database Changes**: Update Payload collections and regenerate types
4. **API Changes**: Update both backend endpoints and frontend API calls
5. **Testing**: Add tests in respective `tests/` directories
