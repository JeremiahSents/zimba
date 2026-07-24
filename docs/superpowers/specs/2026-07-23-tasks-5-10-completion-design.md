# Tasks 5–10 Completion Design

## Objective

Complete the existing, partially implemented Tasks 5–10 without adding Express
or a separate API application. Preserve the current uncommitted work and finish
the agreed internal application architecture:

```text
Next.js Server Component or Server Action
  -> @workspace/api use case
  -> @workspace/db repository
  -> PostgreSQL
```

Next.js Route Handlers remain limited to genuine HTTP interfaces such as file
uploads and external callbacks.

## Boundaries

- `apps/web` owns customer presentation, workspace routing, and thin server
  actions.
- `apps/admin` owns platform-admin presentation and thin protected actions.
- `packages/api` owns framework-independent use cases and authorization rules.
- `packages/db` owns Drizzle schemas, transactions, and repository queries.
- `packages/contracts` owns shared Zod schemas and DTOs.

Only repository files may construct application database queries. Trusted
workspace context is resolved on the server from the authenticated user and the
workspace route; tenant identifiers are never trusted from browser inputs.

## Task 5: Application-Service Foundation

Retain the new application errors, authorization helpers, workspace context,
domain exports, and tests. Tighten public exports and dependency boundaries so
`packages/api` remains independent of Next.js, React, Better Auth, and Drizzle
schemas.

Use cases receive explicit dependencies. Multi-write use cases receive an
explicit transaction runner or execute inside a transaction supplied by the
composition root. The interface must make it impossible for production callers
to accidentally perform a multi-write workflow non-atomically.

## Task 6: Workspace Slugs and Resolution

Reuse the existing unique organization slug schema and migration history. Keep
slug normalization and reserved-name validation in `packages/contracts`.

Workspace resolution must:

1. validate and normalize the incoming slug;
2. find the organization without leaking private existence information;
3. reject inactive or suspended organizations;
4. verify the authenticated user's membership;
5. reject unknown membership roles rather than silently granting viewer access;
6. return a trusted context containing organization ID, slug, name, user ID,
   and role.

Repository lookups remain scoped by organization ID after resolution.

## Task 7: Workspace-Scoped Routing

The protected customer application lives below `[workspaceSlug]`. The workspace
layout authenticates the user and resolves access once for presentation.
Navigation and redirects preserve the route slug.

Legacy `/admin` routes redirect to `/{workspaceSlug}/home`; a workspace index
route may also redirect to `home` to make `/{workspaceSlug}` safe. Public,
authentication, invitation, and onboarding routes remain unscoped.

Mutating server actions accept or derive the route slug and independently
resolve trusted workspace context. They must not use a different "active
organization" stored in the session when the user is viewing another workspace.

## Task 8: Receipt Reference Workflow

Both payable creation and the primary receipt-creation flow use the same
`@workspace/api` receipt use case. The old web service path is removed after all
callers migrate.

Receipt creation validates project, supplier, allocation, file ownership and
file completion inside the trusted organization. Monetary values are integer
cents, totals are derived on the server, and overpayment is rejected.

Creation of the receipt, line items, and optional payment is one database
transaction. Any failure rolls back every write. Tests cover success,
cross-workspace references, incomplete files, invalid allocations, overpayment,
authorization, and rollback.

## Task 9: Receipt UI and Upload Reliability

Receipt pages remain composition-oriented. Oversized client UI is divided into
cohesive receipt form, line-item, totals, payment, upload, and submit
components—without splitting trivial fragments into separate files.

The upload flow validates type and size, shows progress and failure states,
supports retry/removal, and blocks receipt submission while a required upload is
incomplete. Server-side receipt validation remains authoritative for ownership
and completion.

Recoverable failures preserve entered form values, and submission is protected
against duplicates. Components remain accessible and responsive. Loading and
transition feedback are used where delays are meaningful.

## Task 10: Platform-Admin Authorization

Platform authentication and platform roles remain separate from workspace
membership. `super_admin` and `support` are the only platform roles.

All protected layouts, pages, and actions enforce roles on the server.
Role-changing use cases validate input, require a super administrator, prevent
self-escalation and removal of the last super administrator, and append an audit
record in the same transaction as the role mutation.

Tests cover unauthenticated users, ordinary workspace users, support users,
super administrators, invalid roles, direct action invocation, self-demotion,
last-super-admin protection, and audit creation.

## Error Handling

Use typed application errors for validation, unauthenticated, forbidden, not
found, conflict, and unexpected failures. Next.js actions translate expected
application errors to existing action results. Unknown failures are logged and
return a generic message. Workspace lookup failures use a non-leaking response.

## Verification

Each task must pass its package-level formatting, Biome, TypeScript, and test
checks before the next task begins. Final verification is:

```text
pnpm format:check
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

React Doctor runs after React changes. The database tenant-boundary integration
test must be reported as skipped when its test database is unavailable.

Completion requires no direct application queries outside repositories, no
non-atomic receipt workflow, no mismatch between the URL workspace and mutation
context, no client-only platform authorization, and no duplicated receipt
business logic.
