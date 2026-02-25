# ShareApp - Location-based Resource Sharing Application

## Overview

The ShareApp is a sustainable resource sharing application built as a Turborepo monorepo with Payload CMS backend and Ionic Vue frontend. The app enables users to discover and share free resources in their community through an interactive map interface, focusing on sustainability, community sharing, and resource accessibility.

## Core Concept

**Map-first UX**: Users primarily interact through an interactive map to find resources like:
- 🧊 Food sharing fridges
- 👕 Free clothing exchanges  
- 💧 Water sources
- 🌱 Other community resources

## Technical Stack

### Frontend
- **Framework**: Ionic Vue 3 with TypeScript
- **State Management**: Pinia with modular stores
- **Maps**: Mapbox GL JS with custom markers and clustering
- **Animations**: VueUse/GSAP for micro-animations
- **Offline**: IndexedDB caching

### Backend
- **CMS**: Payload CMS 3.46.0
- **Framework**: Next.js 15
- **Database**: MongoDB with Mongoose
- **File Storage**: Sharp for image processing
- **Authentication**: Payload's built-in auth system

### Architecture
- **Monorepo**: Turborepo for efficient builds and caching
- **apps/frontend**: Ionic Vue mobile application
- **apps/backend**: Payload CMS with Next.js API
- **packages/shared**: Common types and utilities

## Key Features

1. **Interactive Map Interface** - Clustered markers with zoom-level dependent detailing
2. **Resource Discovery** - Filter by type, location, and accessibility
3. **Community Contribution** - Add new resources with step-by-step wizard
4. **Resource Details** - Comprehensive information with usage rules and guidelines
5. **User Profiles** - Favorites, contributions, and community reputation
6. **Offline Support** - IndexedDB caching for core functionality

## Development Status

This spec includes detailed requirements, design documentation, and implementation tasks. The project follows test-driven development practices and prioritizes core map functionality first, then adds community features and polish.

## Related Documents

- [Requirements](./requirements.md) - Detailed user stories and acceptance criteria
- [Design](./design.md) - Architecture, components, and design system
- [Tasks](./tasks.md) - Implementation plan with actionable coding tasks

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Start both frontend and backend
pnpm start:all
```

The application targets mobile-first design with cross-platform deployment via Capacitor for iOS and Android.
