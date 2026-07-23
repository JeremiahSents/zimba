# Tasks 1–4 Cleanup Design

## Scope

Review and repair the work completed for Tasks 1–4:

1. Scaffold `@workspace/api` and `@workspace/contracts`.
2. Split `@workspace/db` schemas by business domain.
3. Extract database queries into domain repositories.
4. Centralize Zod contracts and shared DTO types.

The review includes application files changed by those migrations because package
boundaries cannot be verified without checking their consumers. It does not
begin the application API foundation or later workspace, routing, UI, or
performance tasks.

Five pre-existing uncommitted files must be preserved:

- `apps/admin/core/users/invite.ts`
- `apps/web/app/onboarding/actions.ts`
- `apps/web/lib/supplier-data.ts`
- `packages/contracts/src/types/supplier-types.ts`
- `packages/db/src/repositories/auth-repo.ts`

## Package Boundaries

The intended dependency direction is:

```text
apps/web and apps/admin
  -> @workspace/contracts
  -> @workspace/db repositories

@workspace/api
  -> @workspace/contracts
  -> @workspace/db
```

At this stage, existing application services may call database repositories
directly. Task 5 will introduce framework-independent application use cases in
`@workspace/api`.

`@workspace/contracts` owns runtime Zod schemas and shared DTO types.
`@workspace/db` owns Drizzle schemas, database access, and repositories.
`@workspace/api` remains a minimal, server-only scaffold until Task 5.

## Schema Organization

Database schemas remain grouped by business domain:

- `auth-schema.ts`
- `organization-schema.ts`
- `project-schema.ts`
- `receipt-schema.ts`
- `supplier-schema.ts`
- `file-schema.ts`
- `audit-schema.ts`
- `platform-schema.ts`

The cleanup must preserve existing table names, columns, constraints, indexes,
relations, and migration history. It must not generate a migration for
formatting or module reorganization.

Schema index files only re-export definitions. They must not contain business
logic.

## Repository Organization

Repositories remain grouped by business domain:

- `auth-repo.ts`
- `organization-repo.ts`
- `project-repo.ts`
- `receipt-repo.ts`
- `supplier-repo.ts`
- `file-repo.ts`
- `audit-repo.ts`
- `platform-repo.ts`

Repository functions contain Drizzle queries but no UI, transport, or business
authorization logic. Tenant-owned operations require `organizationId`, and
function names make that scope clear.

The cleanup will improve long or dense repository implementations by:

- extracting focused private helpers;
- replacing ambiguous identifiers;
- making tenant conditions visibly explicit;
- selecting only required columns where behavior is unchanged;
- removing duplicated or unused wrappers;
- retaining transaction-compatible database executor arguments.

## Contracts

Zod schemas remain grouped under `packages/contracts/src/zod`. Types inferred
from Zod must not be duplicated manually. The `types` directory contains output
DTOs and other types that do not need runtime parsing.

The root contracts index re-exports the supported public contract surface.
Internal-only helpers should not be exported accidentally.

The cleanup will verify coercion, enum values, size limits, optional fields, and
compatibility with existing callers. It will not introduce new product rules
outside the completed task scope.

## Readability

Biome formatting alone is insufficient. Code changed by Tasks 1–4 and affected
consumers will also be refactored where necessary to:

- break dense one-line expressions into readable blocks;
- split long functions into focused helpers;
- replace misleading names;
- remove unnecessary aliases and pass-through wrappers;
- group imports consistently;
- make control flow and error handling explicit;
- add comments only when the reason cannot be expressed clearly in code.

Behavior must remain stable unless a verified bug is corrected.

## Biome Enforcement

Biome remains the repository formatter and linter.

The cleanup will:

- format tracked source and configuration files with Biome;
- standardize line endings according to `biome.json`;
- configure VS Code to use Biome for TypeScript and TSX;
- preserve a mutating local `format` command;
- add a non-mutating formatting/check command suitable for CI;
- ensure the root/Turbo tasks invoke package checks consistently.

Formatting and linting must be separate in intent, but the final CI-quality
command must fail for either formatting or lint errors.

## Verification

The implementation is complete when these checks pass, apart from explicitly
documented environment-dependent integration tests:

```text
pnpm --filter @workspace/contracts typecheck
pnpm --filter @workspace/contracts test
pnpm --filter @workspace/api typecheck
pnpm --filter @workspace/api test
pnpm --filter @workspace/db typecheck
pnpm --filter @workspace/db test
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test
pnpm --filter admin typecheck
pnpm --filter admin lint
pnpm --filter admin test
pnpm format:check
```

Affected production builds will also be run if required environment variables
are available. Build failures caused by missing external configuration must be
reported separately from code failures.

## Completion Report

The handoff will list:

- correctness issues found and fixed;
- readability refactors;
- Biome configuration and script changes;
- files intentionally left for Task 5 or later;
- exact verification results;
- any remaining risks.
