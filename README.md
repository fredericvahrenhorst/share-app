# ShareApp - Location-based Resource Sharing Application

A sustainable resource sharing application built as a Turborepo monorepo with Payload CMS backend and Ionic Vue frontend. The app enables users to discover and share free resources in their community through an interactive map interface.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9.0.0 or higher
- **MongoDB**: For local development

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Start both frontend and backend together
pnpm start:all
```

## Project Structure

This Turborepo includes the following packages/apps:

### Apps and Packages

- `apps/frontend`: [Ionic Vue](https://ionicframework.com/docs/vue/overview) mobile application with TypeScript
- `apps/backend`: [Payload CMS](https://payloadcms.com/) with [Next.js](https://nextjs.org/) API backend
- `packages/shared`: Common types and utilities shared across applications
- `packages/ui`: React component library (stub)
- `packages/eslint-config`: ESLint configurations for consistent code style

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with strict type checking enabled.

## Key Technologies

### Frontend (apps/frontend)
- **[Ionic Vue 8](https://ionicframework.com/docs/vue/overview)**: Cross-platform mobile framework with Vue 3
- **[Vite](https://vitejs.dev/)**: Fast build tool and development server
- **[Pinia](https://pinia.vuejs.org/)**: State management for Vue applications
- **[Capacitor](https://capacitorjs.com/)**: Native mobile deployment for iOS/Android
- **[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)**: Interactive maps and location services

### Backend (apps/backend)
- **[Payload CMS 3.46.0](https://payloadcms.com/)**: Headless CMS with admin interface
- **[Next.js 15](https://nextjs.org/)**: React framework for API and server-side rendering
- **[MongoDB](https://www.mongodb.com/)**: Document database with Mongoose adapter
- **[Sharp](https://sharp.pixelplumbing.com/)**: High-performance image processing

### Development Tools
- **[Turborepo](https://turborepo.com/)**: Monorepo build system with intelligent caching
- **[TypeScript](https://www.typescriptlang.org/)**: Static type checking across all packages
- **[ESLint](https://eslint.org/)**: Code linting with Vue and React plugins
- **[Prettier](https://prettier.io)**: Consistent code formatting
- **[Vitest](https://vitest.dev/)**: Unit testing framework
- **[Playwright](https://playwright.dev/)**: End-to-end testing

## Development Commands

### Build

Build all apps and packages:

```bash
pnpm build
```

Build specific apps:

```bash
# Build frontend only
turbo build --filter=frontend

# Build backend only  
turbo build --filter=backend
```

### Development

Start all development servers:

```bash
pnpm dev
```

Start specific apps:

```bash
# Frontend only (Ionic Vue app)
pnpm --filter ./apps/frontend dev

# Backend only (Payload CMS + Next.js)
pnpm --filter ./apps/backend dev

# Both frontend and backend together
pnpm start:all
```

### Testing

```bash
# Run all tests
pnpm test

# Backend integration tests
cd apps/backend && pnpm test:int

# Backend E2E tests  
cd apps/backend && pnpm test:e2e

# Frontend unit tests
cd apps/frontend && pnpm test:unit
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

## Application URLs

- **Frontend**: http://localhost:8100 (Ionic development server)
- **Backend**: http://localhost:3000 (Payload CMS admin + API)
- **Alternative Frontend**: http://localhost:5173 (Vite fallback)

## Environment Setup

1. Copy environment files:
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/backend/.env.example apps/backend/.env
   ```

2. Configure MongoDB connection in `apps/backend/.env`:
   ```
   DATABASE_URI=mongodb://localhost:27017/shareapp
   PAYLOAD_SECRET=your-secret-key
   ```

3. Start MongoDB locally or use Docker:
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

## Mobile Development

The frontend is built with Ionic and can be deployed to mobile devices:

```bash
cd apps/frontend

# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
pnpm build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## Core Features

- **Interactive Map Interface**: Discover resources through clustered map markers
- **Resource Categories**: Organize locations by type (food sharing, clothing, water sources)
- **Community Contributions**: Add new resources with step-by-step wizard
- **User Profiles**: Favorites, contributions, and community reputation
- **Reviews & Ratings**: User-generated feedback for locations
- **Offline Support**: IndexedDB caching for core functionality
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## Architecture

The application follows a map-first UX approach where users primarily interact through an interactive map to find resources like food sharing fridges, free clothing exchanges, water sources, and other community resources.

### Shared Packages

- **packages/shared**: Common TypeScript types and utilities used across frontend and backend
- **packages/ui**: Reusable React components (development stub)
- **packages/eslint-config**: Shared ESLint configurations for consistent code style

Import shared utilities:
```typescript
import { greet, User } from '@test/shared';
```

## Useful Links

- [Ionic Vue Documentation](https://ionicframework.com/docs/vue/overview)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Turborepo Documentation](https://turborepo.com/docs)
- [Project Specification](.kiro/specs/location-app-enhancement/spec.md)
