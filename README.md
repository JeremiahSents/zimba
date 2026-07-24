# Zimba

A pnpm monorepo built with Next.js 16, React 19, Drizzle ORM, and Better Auth.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 11.7.0 (enable with `corepack enable` if needed)
- **PostgreSQL** database

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   Copy the example env file and fill in your values:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   Key variables:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `BETTER_AUTH_SECRET` | Random string (>= 32 chars) for auth sessions |
   | `BETTER_AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
   | `UPLOADTHING_TOKEN` | UploadThing API token |
   | `RESEND_API_KEY` / `RESEND_FROM` | Resend email credentials |

3. **Generate and run database migrations**

   ```bash
   pnpm generate
   pnpm migrate
   ```

   Optionally seed the database:

   ```bash
   pnpm --filter @workspace/db db:seed
   ```

4. **Start the dev servers**

   ```bash
   pnpm dev          # all apps via Turbo
   pnpm web          # web app only (port 3000)
   pnpm admin        # admin app only (port 4000)
   ```

## Project Structure

```
zimba/
├── apps/
│   ├── web/          # Main Next.js app (port 3000)
│   └── admin/        # Admin dashboard (port 4000)
├── packages/
│   ├── ui/                   # Shared UI components (shadcn/ui, Tailwind v4)
│   ├── db/                   # Drizzle ORM schema, migrations & repositories
│   ├── auth/                 # Better Auth configuration
│   ├── api/                  # Server-side API layer
│   ├── api-runtime/          # API runtime helpers
│   ├── contracts/            # Zod validation schemas & shared types
│   ├── transactional/        # React Email templates & Resend integration
│   └── typescript-config/    # Shared tsconfig presets
```

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode (Turbo) |
| `pnpm web` | Start the web app only |
| `pnpm admin` | Start the admin app only |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages (Biome) |
| `pnpm format` | Format all files (Biome) |
| `pnpm format:check` | Check formatting without writing |
| `pnpm typecheck` | TypeScript type-checking across all packages |
| `pnpm test` | Run tests (Vitest) |
| `pnpm generate` | Generate Drizzle migrations |
| `pnpm migrate` | Run Drizzle migrations |
| `pnpm check` | Run boundary checks + CI checks |

## Adding UI Components

Components are managed via shadcn/ui and stored in `packages/ui/src/components`:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import them in any app:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Monorepo:** pnpm workspaces + Turborepo
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (with Google OAuth)
- **Email:** Resend + React Email
- **File uploads:** UploadThing
- **Validation:** Zod
- **Linting/Formatting:** Biome
- **Testing:** Vitest
