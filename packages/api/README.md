# @workspace/api

Framework-independent application services and use cases for Zimba.

## Allowed dependency direction

```
apps (web, admin)
  → @workspace/contracts   (Zod schemas, DTOs, input/output types)
  → @workspace/api          (use cases, application errors, workspace context)
      → @workspace/db       (repositories, DatabaseExecutor type)
```

## Rules

- `@workspace/api` must **never** import:
  - Next.js
  - React
  - Better Auth
  - Drizzle schemas directly
  - UI packages

- Use cases accept a `WorkspaceContext` (trusted server data) separately from user input.
- Use cases accept a `DatabaseExecutor` explicitly so they can be tested without a global database connection.
- All database operations live in `@workspace/db/repositories`.
- Shared validation belongs in `@workspace/contracts`.

## Structure

```
packages/api/src/
  index.ts                      — package root, re-exports all domains
  shared/
    application-error.ts        — typed application errors
    authorization.ts            — role checks and hierarchy
    workspace-context.ts        — trusted server context type
  receipts/
    create-receipt.ts           — create receipt use case (reference implementation)
    get-receipt.ts              — read single receipt
    list-receipts.ts            — list receipts for workspace
  projects/
    index.ts                    — project use cases
  suppliers/
    index.ts                    — supplier use cases
```
