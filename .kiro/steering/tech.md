# Technology Stack

## Build System & Package Management

- **Monorepo**: Turborepo for build orchestration and caching
- **Package Manager**: pnpm (v9.0.0+)
- **Node.js**: v18+ required
- **TypeScript**: v5.8.3 for type safety across all packages

## Frontend (apps/frontend)

- **Framework**: Ionic Vue 8 + Vue 3 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 with custom design system
- **State Management**: Pinia
- **Maps**: Mapbox GL JS
- **Mobile**: Capacitor 7 for iOS/Android deployment
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint with Vue plugin

## Backend (apps/backend)

- **CMS**: Payload CMS 3.46.0
- **Framework**: Next.js 15
- **Database**: MongoDB with Mongoose adapter
- **Rich Text**: Lexical editor
- **File Storage**: Sharp for image processing
- **Testing**: Playwright (E2E) + Vitest (integration)
- **Runtime**: Node.js with cross-env for environment handling

## Shared Packages

- **packages/shared**: Common types and utilities
- **packages/ui**: React component library (stub)
- **packages/eslint-config**: Shared ESLint configurations

## Common Commands

### Development
```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter ./apps/frontend dev
pnpm --filter ./apps/backend dev

# Start both frontend and backend together
pnpm start:all
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
turbo build --filter=frontend
```

### Testing
```bash
# Run all tests
pnpm test

# Backend tests
cd apps/backend
pnpm test:int    # Integration tests
pnpm test:e2e    # End-to-end tests

# Frontend tests
cd apps/frontend
pnpm test:unit   # Unit tests
```

### Database & Seeding
```bash
# Seed backend with test data
cd apps/backend
pnpm seed
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

## Environment Variables

- Root `.env` file for shared configuration
- Frontend uses `VITE_` prefixed variables
- Backend uses standard Node.js environment variables
- Key variables: `DATABASE_URI`, `PAYLOAD_SECRET`, `FRONTEND_URL`

## Development Ports

- Frontend: http://localhost:8100 (Ionic default)
- Backend: http://localhost:3000 (Next.js default)
- Alternative frontend: http://localhost:5173 (Vite fallback)