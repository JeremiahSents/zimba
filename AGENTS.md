<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Where code goes

Three homes, and the dependency arrow only ever points down:

```
apps/web, apps/admin   UI, and server actions that check auth then call one use case
        ↓
@workspace/api         business logic: use cases + the input schemas they enforce
        ↓
@workspace/db          Drizzle tables and the queries over them
```

Deciding where something belongs:

- A table, a column, or a query → `packages/db/src/<domain>/` (`schema.ts` and `queries.ts` sit side by side)
- A rule, a permission check, a transaction, or an input schema → `packages/api/src/<domain>/`
- Pixels, or an action that resolves the session and calls a use case → `apps/*/core/<domain>/actions.ts`

Conventions:

- Use cases take `(ctx, input)`. They import `db` directly — nothing is injected. Transactions are opened by the use case with `db.transaction`.
- Query functions take an executor first (`db` or a transaction), which is what lets a use case compose them inside one transaction.
- Server actions stay thin: `ensureActionSession()` → `requireWorkspaceContext()` → use case → `revalidatePath`. Validation belongs to the use case's Zod schema, not the action.
- `@workspace/api/schemas` is the client-safe entry point — import it from a form; it never pulls in the database.
- Tests live in their package's `tests/` folder, mirroring `src/` — never beside the code. Inside `packages/*`, a test reaches its subject with `../../src/...`; inside `apps/*`, with the `@/` alias (including in `vi.mock`).
- One name per table: the Drizzle export, the SQL table, and the folder agree. No compatibility aliases.

## Migrations

Change `packages/db/src/<domain>/schema.ts`, then run `pnpm generate` and `pnpm migrate` — never write the SQL by hand. Two things to know:

- `drizzle-kit generate` asks, interactively, whether a table was renamed or dropped-and-recreated. Answer honestly: choosing "create" on a rename drops the table and everything in it. It needs a real terminal, so run it from your own shell rather than a tool that pipes stdin.
- `pnpm --filter @workspace/db exec node scripts/verify-schema-sync.mjs` compares the live database against the newest snapshot and names anything that drifted. `scripts/backup-json.mjs` dumps every table to `.backups/` first, which is worth doing before anything destructive.

`pnpm check:boundaries` enforces the arrows: apps may not import `@workspace/db` or Drizzle, and `packages/api` may not import Next.js, React, or Better Auth.


- Do not preserve backward compatibility. Remove obsolete paths instead of
adding compatibility layers, fallbacks, or migrations.
- Choose the simplest implementation that fully meets the current
requirements. Avoid speculative abstractions, configuration, and
indirection.
- Grow the system in layers. Start from the smallest version that works end
to end, and add each new capability on top of a product that already
works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall
complexity or improve reliability. Do not reimplement common
functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own
implementation or adding packages. Do not assume a library lacks a
capability without checking its documentation and types.
Make architectural decisions for the long term. Do not accept a stopgap
that only works for now and is meant to be replaced later.