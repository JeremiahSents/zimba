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

`pnpm check:boundaries` enforces the arrows: apps may not import `@workspace/db` or Drizzle, and `packages/api` may not import Next.js, React, or Better Auth.
