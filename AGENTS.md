# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
ShareApp is a Turborepo monorepo with two apps and three packages. See `README.md` for the full project structure, development commands, and coding conventions.

### Services

| Service | Port | Start command |
|---------|------|---------------|
| Backend (Payload CMS + Next.js) | 3000 | `pnpm --filter ./apps/backend dev` |
| Frontend (Ionic Vue + Vite) | 5173 | `pnpm --filter ./apps/frontend dev` |
| MongoDB | 27017 | Docker: `sudo docker start mongodb` (container already exists) |

### Startup order
1. MongoDB must be running before the backend starts.
2. Backend must be running before the frontend can fetch data.

### Environment files
The `.env` files should be generated from injected Cursor Cloud secrets (environment variables):
- `apps/frontend/.env` — uses `MAPBOX_ACCESS_TOKEN`, `BASE_URL`, `API_URL`
- `apps/backend/.env` — uses `DATABASE_URI`, `PAYLOAD_SECRET`, `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME`

The backend database name in `DATABASE_URI` should be `share-app` (the name Payload creates by default).

### Gotchas
- `@payloadcms/email-nodemailer` is used in `payload.config.ts` but was missing from `package.json`. It has been added; if it disappears again after a branch change, run `pnpm add @payloadcms/email-nodemailer@3.46.0` in `apps/backend`.
- The `turbo.json` only defines `build` and `dev` tasks. Running `pnpm lint` from the root fails because there's no `lint` task in turbo. Run lint per-app instead: `pnpm --filter ./apps/frontend lint` and `pnpm --filter ./apps/backend lint`.
- The frontend Vite dev server runs on port **5173** (not 8100 as some docs suggest).
- The `packages/ui` stub references `@repo/typescript-config/react-library.json` which doesn't exist. This causes harmless tsconfig warnings in vitest but doesn't affect test execution.
- Frontend lint has ~130 pre-existing style errors (mostly missing semicolons due to Prettier `semi: false` conflicting with ESLint `semi` rule); backend lint passes with warnings only.
- `pnpm build` for the frontend fails due to a pre-existing BigInt incompatibility between `mapbox-gl` and `@vitejs/plugin-legacy`. The dev server (`pnpm dev`) works fine. If a production build is needed, the legacy plugin must be updated or removed.
- First user registration via `/api/users/first-register` creates a user with `["user"]` role. To get admin access, update the role in MongoDB directly: `db.users.updateOne({email:"..."},{$set:{roles:["admin","user"]}})` in the `share-app` database.

### Design-System (Bold Style)

**Fonts:**
- Body: **Fira Sans 400** (Weights: 300–700)
- Headlines: **Alegreya Sans 800** (Weights: 700–900)
- Geladen via Google Fonts in `src/css/detail-styles/bold.css` (single source of truth)
- Tailwind `--font-sans` → Fira Sans, `--font-display` → Alegreya Sans

**Brand-Farben:**
| Token | Hex | Verwendung |
|-------|-----|------------|
| `--color-brand-primary` | `#333333` | Primary/Buttons/Text/Toolbar-BG |
| `--color-brand-secondary` | `#275243` | Forest Green / Info-Cards / Links |
| `--color-brand-featured` | `#D7EB80` | Lime / CTA-Buttons / Tags / Stars / Tab-Bar-Akzent |
| `--color-background-primary` | `#ffffff` | Content-BG |
| `--color-background-secondary` | `#f8f8f6` | Page-BG / Ionic Content |
| `--color-text-secondary` | `#6c6c6c` | Sekundärtext |
| `--color-disabled` | `#deded9` | Borders / Disabled |
| `--color-error` | `#B90A32` | Fehler / Danger |
| `--color-success` | `#008009` | Erfolg / Verifiziert |

**Tailwind-Farb-Skalen** (in `src/theme/variables.css`):
- `primary-50..950`: Charcoal (#f8f8f6 → #000000)
- `secondary-50..950`: Forest Green (#eef5f2 → #070e0c)
- `accent-50..950`: Lime (#f9fce8 → #202400)
- `neutral-50..950`: Matching zur primary-Skala
- `success/warning/error`: Eigene Skalen basierend auf Brand-Farben

**Design-Regeln:**
- Ionic läuft immer im `ios`-Mode (`main.js: IonicVue, { mode: 'ios' }`)
- Toolbars: Dunkles `#333333` mit weißem Text, Icons in Lime `#D7EB80`
- Buttons solid: Lime-BG `#D7EB80` + Dark-Text, uppercase, letter-spacing 0.04em
- Section-Titles: Alegreya 800, 3px Lime-Underline, inline-block
- Info-Cards: Gefüllte Farbblöcke (Forest Green oder Charcoal), keine Borders
- Tags: Lime filled, 0.25rem Radius
- Tab-Bar: Dark `#333333`, 3px Lime-Top-Border, selected = Lime
- Full-bleed Bilder in Detail-Views (kein Radius)
- Links: Forest Green statt Blau

**CSS-Architektur:**
1. `src/css/detail-styles/bold.css` — Globales Design-System (Font-Import + 18 Bereiche)
2. `src/css/variables.css` — Ionic CSS Variables
3. `src/theme/variables.css` — Tailwind @theme Farb-Skalen + Component-Klassen
4. `src/css/main.css` — Tailwind @theme Fonts + Ionic-Bridge-Variablen
5. `src/css/accessibility.css` — WCAG (reduced-motion, focus-visible, sr-only)

### Commands reference
See `README.md` "Development Commands" section for lint, test, build, and format commands.
