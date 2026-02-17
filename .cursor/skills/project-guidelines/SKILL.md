# Project Guidelines – ShareApp

Projekt-spezifische Skill für die ShareApp (Location-/Ressourcen-App). Nutze diese Guideline bei allen AI-Operationen in diesem Repo.

---

## When to Use

Diese Skill referenzieren bei der Arbeit an der ShareApp. Sie enthält:

- Architektur-Überblick (Monorepo, Frontend/Backend)
- Dateistruktur und Namenskonventionen
- Code-Patterns (Vue, Pinia, Payload CMS, API)
- Test-Anforderungen und Befehle
- Deployment-Checkliste und Umgebungsvariablen
- Kritische Regeln (Step-by-Step-Plan, keine TS in .js/.vue, Deutsch)

---

## Architecture Overview

**Tech Stack:**

- **Frontend**: Ionic Vue 8, Vite 5, Vue 3 (Composition API), Tailwind CSS 4, Pinia, Mapbox GL JS, Capacitor 7, vue-i18n
- **Backend**: Payload CMS 3.46, Next.js 15, MongoDB, Mongoose, Sharp
- **Shared**: packages/shared (Typen, Utils), packages/eslint-config
- **Node**: >=20, pnpm, TypeScript 5.8.3
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)

**Services:**

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Ionic Vue 8 + Vite + Tailwind + Pinia + Mapbox             │
│  Port: 8100 (Ionic) / 5173 (Vite)                           │
│  Mobile: Capacitor 7 (iOS/Android)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  Payload CMS 3 + Next.js 15 + MongoDB                       │
│  Port: 3000, Admin: /admin                                  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ MongoDB  │   │  Sharp   │   │  Shared  │
        │ (Daten)  │   │ (Media)  │   │ (Types)  │
        └──────────┘   └──────────┘   └──────────┘
```

---

## File Structure

```
share-app/
├── apps/
│   ├── frontend/                 # Ionic Vue App
│   │   └── src/
│   │       ├── components/      # Vue-Komponenten (PascalCase)
│   │       │   ├── LocationCard.vue
│   │       │   ├── LocationDetail.vue
│   │       │   ├── LocationMap.vue
│   │       │   ├── PageHeader.vue
│   │       │   ├── SearchModal.vue
│   │       │   └── SettingsModal.vue
│   │       ├── composables/     # useXxx (camelCase)
│   │       │   └── apiCall.js
│   │       ├── css/             # Globale Styles (kebab-case)
│   │       │   ├── helper.css
│   │       │   ├── main.css
│   │       │   └── variables.css
│   │       ├── layouts/
│   │       ├── locales/         # i18n (de.json, …)
│   │       ├── store/           # Pinia Stores (camelCase + Store)
│   │       │   ├── appStore.js
│   │       │   ├── locationsStore.js
│   │       │   └── userStore.js
│   │       ├── views/           # Pages (PascalCase)
│   │       │   ├── CategoriesPage.vue
│   │       │   ├── FavoritesPage.vue
│   │       │   ├── ProfilPage.vue
│   │       │   └── StartPage.vue
│   │       └── main.js
│   │
│   └── backend/                  # Payload CMS + Next.js
│       └── src/
│           ├── collections/     # Payload Collections (PascalCase)
│           │   ├── Categories.ts
│           │   ├── Favorites.ts
│           │   ├── Locations.ts
│           │   ├── Media.ts
│           │   ├── Reports.ts
│           │   ├── Reviews.ts
│           │   └── Users.ts
│           ├── endpoints/        # Custom API (kebab-case)
│           │   ├── locations.ts
│           │   └── search.ts
│           ├── middleware/
│           ├── scripts/
│           ├── payload.config.ts
│           └── payload-types.ts # Generierte Typen
│
├── packages/
│   ├── shared/                  # Gemeinsame Typen & Utils
│   ├── ui/                      # React-Komponenten (Stub)
│   └── eslint-config/
│
├── .cursor/rules/               # coding-conventions.mdc, project-rules.mdc
├── .kiro/                       # Specs, steering, hooks
├── turbo.json
├── pnpm-workspace.yaml
└── package.json                 # pnpm, Node >=20
```

---

## Code Patterns

### Frontend – API-Aufrufe (Composable apiCall)

```javascript
// apps/frontend/src/composables/apiCall.js
// Verwendung: apiCall(endpoint, options?, token?)
// Basis-URL aus process.env (API_URL)

import apiCall from '@/composables/apiCall'

// Beispiel aus Store oder Komponente
const data = await apiCall('/api/locations?limit=10', { method: 'GET' }, token)
```

- Immer Optional Chaining bei API-Daten: `resource?.title`, `list?.length`
- Fehlerbehandlung: Toast über apiCall; zusätzlich Loading-States und Retry im UI

### Frontend – Pinia Store

```javascript
// apps/frontend/src/store/locationsStore.js
import { defineStore } from 'pinia'
import apiCall from '@/composables/apiCall'

export const useLocationsStore = defineStore('locations', {
    state: () => ({
        items: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchLocations() {
            this.loading = true
            this.error = null
            try {
                const data = await apiCall('/api/locations')
                this.items = data?.docs ?? []
            } catch (e) {
                this.error = e.message
            } finally {
                this.loading = false
            }
        },
    },
})
```

- Stores: camelCase + „Store“ (z. B. `locationsStore.js`)
- Composables: camelCase mit `use`-Präfix (z. B. `useApi`, `useMapbox`)

### Frontend – Vue SFC (Composition API)

```vue
<template>
    <section class="relative flex w-full flex-col gap-3">
        <LocationCard
            v-for="item in locations"
            :key="item.id"
            :location="item"
            @favorite-toggled="handleFavorite"
        />
    </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import LocationCard from '@/components/LocationCard.vue'
import { useLocationsStore } from '@/store/locationsStore'

const locationsStore = useLocationsStore()
const { items: locations } = storeToRefs(locationsStore)

const emit = defineEmits(['favorite-toggled'])
function handleFavorite(id) {
    emit('favorite-toggled', id)
}
</script>
```

- SFC-Reihenfolge: `<template>` → `<script setup>` → `<style>`
- Events im Template: kebab-case (`@favorite-toggled`)
- Keine TypeScript-Syntax in `.js`- und `.vue`-Dateien (nur JSDoc bei Bedarf)
- Tailwind: Utility-first; Klassen-Reihenfolge: Layout → Box-Modell → Styling → States → Responsive

### Frontend – Mapbox

- Keine Tokens im Code; `MAPBOX_ACCESS_TOKEN` aus Env (z. B. VITE_MAPBOX_ACCESS_TOKEN)
- Teure `render`-Listener vermeiden oder debouncen

### Backend – Payload CMS Collection

```javascript
// apps/backend/src/collections/Locations.ts (Beispielstruktur)
import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
    slug: 'locations',
    labels: { singular: 'Ort', plural: 'Orte' },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'category', 'status'],
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'relationship', relationTo: 'categories' },
        {
            type: 'row',
            fields: [
                { name: 'lat', type: 'number', admin: { width: '50%' } },
                { name: 'lng', type: 'number', admin: { width: '50%' } },
            ],
        },
    ],
}
```

- Collections: PascalCase; Slugs: kebab-case
- Admin-UI: `type: 'row'` und `admin.width` für übersichtliche Felder
- Bedingte Felder: `admin.condition: (data, siblingData) => …`
- Wiederverwendbare Field-Funktionen für Links, Buttons, Uploads

### Backend – Custom Endpoints

- RESTful, Prefix `/api/`
- Geodaten: [lng, lat]; Filter, Pagination, einheitliche Fehlerantworten
- Keine Secrets im Code; `.env`; keine Stacktraces nach außen

---

## Testing Requirements

### Frontend (Vitest)

```bash
pnpm --filter ./apps/frontend test:unit
```

- Unit-Tests für Stores, Composables, Geschäftslogik
- Given/When/Then; stabile Selektoren; keine Sleeps
- UI-Tests sparsam; Fokus auf kritische Pfade

### Backend (Vitest + Playwright)

```bash
# Integration
pnpm --filter ./apps/backend test:int

# E2E
pnpm --filter ./apps/backend test:e2e
```

- Integration: API, Payload-Hooks, Services
- E2E: Kritische Flows (z. B. Login, Ressourcen laden)

### Qualität

- Vor Commit: `pnpm format`, `pnpm lint`, `pnpm check-types`
- Performance: FCP <2s, LCP <3s
- Accessibility: WCAG 2.1 AA; ARIA, Keyboard, Focus-Management

---

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] Alle Tests lokal grün (frontend test:unit, backend test:int + test:e2e)
- [ ] `pnpm build` im Root erfolgreich
- [ ] Keine hartkodierten Secrets; Umgebungsvariablen dokumentiert
- [ ] Payload-Typen aktuell (falls generiert)

### Commands

```bash
# Monorepo
pnpm install
pnpm format
pnpm lint
pnpm check-types
pnpm build

# Frontend einzeln
pnpm --filter ./apps/frontend dev
pnpm --filter ./apps/frontend test:unit

# Backend einzeln
pnpm --filter ./apps/backend dev
pnpm --filter ./apps/backend test:int
pnpm --filter ./apps/backend test:e2e
```

### Environment Variables

```bash
# Root / Frontend (.env)
VITE_MAPBOX_ACCESS_TOKEN=...
VITE_API_URL=http://localhost:3000   # oder Production-API

# Backend (.env)
DATABASE_URI=mongodb://...
PAYLOAD_SECRET=...
# CORS, JWT, ggf. Sharp – siehe Backend-Doku
```

- Frontend: `VITE_`-Prefix für Expose
- Ports: Frontend 8100 (Ionic) / 5173 (Vite), Backend 3000

---

## Critical Rules

1. **Step-by-Step-Plan**: Vor Codeänderungen Plan erstellen, User-Approval einholen, Reasoning und Auswirkungen dokumentieren.
2. **Kein TypeScript in .js/.vue**: In JavaScript- und Vue-Dateien keine TS-Syntax; Typen nur in `.ts`/`packages/shared` oder per JSDoc.
3. **Antwortsprache**: Immer auf Deutsch antworten.
4. **Stil**: `pnpm format`, `pnpm lint`, `pnpm check-types` vor Commit; Prettier (100 Zeichen, singleQuote, trailingComma, semi: false).
5. **Keine Secrets** im Code; nur `.env` und dokumentierte Env-Variablen.
6. **Fehlerbehandlung**: Try/Catch mit hilfreichen Fehlern; Loading-, Retry- und Offline-States im UI; keine swallowed errors.
7. **i18n**: Keine hartkodierten UI-Texte; immer `t('…')` mit konsistenten Keys (mind. Deutsch).
8. **Accessibility**: WCAG 2.1 AA; große Touch-Targets; ARIA; Keyboard- und Focus-Management für Modals/Sheets.
9. **Kleine, fokussierte Dateien**: Lesbarkeit vor Cleverness; keine toten/auskommentierten Blöcke.
10. **Payload Admin-UI**: Row-Layouts, Conditions, wiederverwendbare Field-Funktionen; keine Duplikation in Collections.

---

## Related Skills & Rules

- **`.cursor/rules/coding-conventions.mdc`** (alwaysApply) – Formatierung, Linting, TypeScript, Vue/React/Backend, Tailwind-Reihenfolge, A11y
- **`.cursor/rules/project-rules.mdc`** – Architektur, Technologiestack, Workflow, UI/UX, API, Security, Testing, Cursor-AI-Regeln
- **`.kiro/steering/structure.md`** – Detaillierte Ordner- und Namenskonventionen
- **`.kiro/specs/location-app-enhancement/`** – Requirements, Design, Tasks für Location-App-Features
- **tdd-workflow** (falls vorhanden) – Test-driven Development
