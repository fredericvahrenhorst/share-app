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
Copy from `.env.example` if `.env` doesn't exist:
- `apps/backend/.env` — requires `DATABASE_URI` (MongoDB connection), `PAYLOAD_SECRET`
- `apps/frontend/.env` — requires `API_URL` (default `http://localhost:3000/api`)

The backend database name in `DATABASE_URI` should be `share-app` (the name Payload creates by default).

### Gotchas
- `@payloadcms/email-nodemailer` is used in `payload.config.ts` but was missing from `package.json`. It has been added; if it disappears again after a branch change, run `pnpm add @payloadcms/email-nodemailer@3.46.0` in `apps/backend`.
- The `turbo.json` only defines `build` and `dev` tasks. Running `pnpm lint` from the root fails because there's no `lint` task in turbo. Run lint per-app instead: `pnpm --filter ./apps/frontend lint` and `pnpm --filter ./apps/backend lint`.
- The frontend Vite dev server runs on port **5173** (not 8100 as some docs suggest).
- The `packages/ui` stub references `@repo/typescript-config/react-library.json` which doesn't exist. This causes harmless tsconfig warnings in vitest but doesn't affect test execution.
- Frontend lint has ~51 pre-existing style errors (mostly missing semicolons); backend lint passes with warnings only.
- First user registration via `/api/users/first-register` creates a user with `["user"]` role. To get admin access, update the role in MongoDB directly: `db.users.updateOne({email:"..."},{$set:{roles:["admin","user"]}})` in the `share-app` database.

### Commands reference
See `README.md` "Development Commands" section for lint, test, build, and format commands.
