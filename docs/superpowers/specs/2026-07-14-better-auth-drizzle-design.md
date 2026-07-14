# Better Auth and Drizzle Integration Design

## Goal

Replace the mocked Zimba login and temporary API session token with real email/password authentication managed by Better Auth in the Next.js application.

## Architecture

- Better Auth runs inside the Next.js application at `/api/auth/[...all]`.
- Drizzle ORM connects Better Auth to the shared Neon PostgreSQL database.
- Better Auth owns the `user`, `session`, `account`, and `verification` tables.
- The browser receives Better Auth's secure, HTTP-only session cookie.
- Server Components and Server Actions resolve the session through Better Auth.
- The server forwards the session's raw database token to the Zimba backend in the `Authorization: Bearer <token>` header.
- The backend validates the token against the same Better Auth `session` table and checks its expiration.
- The existing `X-Organization-Id` header remains independently configured until organization membership is connected.

## Authentication Features

- Email and password signup.
- Email and password login.
- Logout.
- No social providers, email verification, password reset, JWT plugin, or organization plugin in this first integration.
- `/admin/*` routes redirect unauthenticated visitors to `/login`.
- Authenticated visitors opening `/login` are redirected to `/admin/home`.

## Database and Migrations

- The Python-style `postgresql+psycopg://` URL is normalized to `postgresql://` for the Node.js PostgreSQL driver.
- The Better Auth CLI generates the Drizzle schema.
- Drizzle Kit generates and applies SQL migrations.
- Database credentials and Better Auth secrets remain in ignored environment files and are never committed.

## Error Handling and Security

- Login and signup failures are displayed inline without exposing database details.
- API access remains server-only; the session token is never placed in local storage.
- Server Actions independently resolve an authenticated session before mutations.
- Better Auth's default CSRF protections and HTTP-only cookie behavior remain enabled.
- Production deployment must define `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ZIMBA_API_BASE_URL`, and `ZIMBA_ORGANIZATION_ID`.

## Verification

- Generate and apply the authentication migration.
- Create an account and confirm the four Better Auth tables are populated.
- Confirm unauthenticated admin navigation redirects to login.
- Confirm login creates a session and authenticated server-side API calls forward its token.
- Run formatting/lint checks, TypeScript checks, the production build, and React diagnostics.
