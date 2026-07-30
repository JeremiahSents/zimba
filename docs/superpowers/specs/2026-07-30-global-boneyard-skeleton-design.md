# Global Boneyard Skeleton Design

## Purpose

Standardize loading states across the user-facing web and admin applications without replacing each route's page-specific loading structure. Use one repository-level Boneyard configuration and one shared wrapper so skeleton behavior, colors, animation, and accessibility remain consistent.

## Scope

- Install `boneyard-js` with pnpm in the workspace packages that render React UI.
- Add one root `boneyard.config.json` shared by both apps.
- Add a reusable wrapper in `packages/ui` around Boneyard's React `Skeleton`.
- Register generated bones once from each app's root layout.
- Wire the wrapper into existing `loading.tsx` screens in `apps/web` and `apps/admin`.
- Use fixture-based generation; do not configure real authentication or credentials for capture.
- Preserve route-specific loading layouts and provide a fallback when generated bones are unavailable.

## Configuration

The root config owns responsive breakpoints, output location, capture wait time, light/dark colors, animation mode, animation speed, and shimmer settings. The chosen defaults should produce a restrained loading state that does not wash out the whole page. Both apps use the same runtime defaults and generated registry convention.

## Shared wrapper

`packages/ui` exposes a client-compatible `BoneyardSkeleton` component. It accepts a unique name, loading state, children, optional fixture, and optional class name. It applies the global visual defaults and accessibility metadata. When `loading` is false it renders children. When loading is true but generated bones are unavailable, it renders the existing children-based fallback rather than leaving a blank page.

The wrapper must not contain application-specific data fetching or authentication logic. Loading routes remain responsible for their static placeholder composition.

## App integration

Each application root layout imports its generated Boneyard registry once. Route loading files wrap their existing placeholder composition with a unique name. Names must be stable and unique within the app. Existing semantic `aria-busy`, `aria-label`, and screen-reader text are retained.

The first migration covers the existing web workspace, settings, and admin loading routes discovered during implementation. Any additional loading routes found in the route tree are wired using the same pattern.

## Generation

Bones are generated from the running development app using Boneyard's CLI at the configured breakpoints. Authenticated pages use representative fixture content or their static loading composition; no production data, session cookies, or secrets are used. Generated output is checked into the repository if required by the package's normal import flow, and the registry import must resolve in production builds.

## Verification

- Install dependencies with pnpm and verify the lockfile changes are limited to the requested dependency.
- Run the Boneyard generation command against the development server where supported.
- Run workspace typecheck, lint, and relevant tests.
- Verify both apps compile with registry imports.
- Manually inspect representative loading routes at narrow and wide viewport sizes.
- Confirm the no-bones fallback remains visible and accessible.

## Deferred

- Capturing real authenticated application pages.
- Reworking the actual page layouts or data-fetching behavior.
- Replacing all static placeholder markup with a single generic global skeleton.
