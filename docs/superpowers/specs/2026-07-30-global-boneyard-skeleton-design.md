# Global Boneyard Skeleton Design

## Purpose

Replace the hand-written placeholder markup in every `loading.tsx` with a
skeleton measured from the page it actually stands in for, so the loading state
and the loaded page share a silhouette instead of only a colour scheme.

## How Boneyard works

Boneyard is a build-time tool, not a runtime one. A headless browser visits the
real application, measures the DOM inside each marked element, and writes the
box geometry to a `.bones.json` file. At runtime the skeleton component replays
that geometry — it never measures anything itself, so there is no layout shift
and no hydration dependency.

The consequence that shapes this design: **bones must be captured from the real
page, not from a placeholder.** Wrapping a `loading.tsx` in the capture
component produces a skeleton of a skeleton, and Next's `loading.tsx` is a
transient Suspense fallback that a crawler never sees in the DOM at all.

## Shape of the integration

`packages/ui/src/components/bones.tsx` exposes the two halves of one contract,
joined by a shared `name`:

- `BoneCapture` sits in `page.tsx` around the real content. At runtime it
  renders children untouched; only the CLI's browser reads the marker.
- `BoneSkeleton` sits in `loading.tsx`. It resolves bones for that name and
  falls back to its children when the name has no bones yet.

`BoneSkeleton` passes `select="viewport"`. Bones are keyed by the viewport width
the CLI captured at, while these skeletons render inside a sidebar shell whose
container is narrower — matching on container width picks the wrong breakpoint.

The plain `Skeleton` primitive stays a server component; only `bones.tsx` is
`"use client"`.

### Where the wrappers sit

`BoneCapture` wraps the outermost element the matching `loading.tsx` replaces,
so the captured container and the replay container are the same width.

- Admin: `AdminDashboardShell` takes a `boneName` prop and wraps itself, so each
  page opts in with one attribute.
- Web: the sidebar and topbar live inside the page's `DashboardShell`, not in
  the segment layout, so `loading.tsx` replaces the entire shell. `BoneCapture`
  therefore wraps at the `page.tsx` root, and the captured bones include the
  sidebar and topbar the old placeholders dropped entirely.

## Captured names

Web (`apps/web/boneyard.config.json`): `web-home`, `web-expenses`,
`web-projects`, `web-reports`, `web-settings`, and `web-shell` — the last
captured from `/team` and replayed by the segment-level `[workspaceSlug]`
loading route that covers every child route without one of its own.

Admin (`apps/admin/boneyard.config.json`): `admin-dashboard` (captured from
`/overview`, replayed by the `(dashboard)` group loading route), plus
`admin-activity`, `admin-applications`, `admin-organizations`, `admin-payments`,
`admin-projects`, `admin-receipts`, `admin-suppliers`, `admin-users`.

Two loading routes stay static, with no bones and no capture point:

- `invite/[token]` — keyed by a single-use token, so there is no stable URL.
- admin `transfers` — the page only redirects, so nothing renders to measure.

## Configuration

One config per app, because the CLI reads `boneyard.config.json` from its
working directory and resolves `out` relative to it. Each config owns the
breakpoints, output directory, capture wait, and the runtime colour and
animation defaults that the generated registry applies via `configureBoneyard`.

Routes are declared under `skeletons` as a guided crawl. Filesystem discovery
cannot reach these pages: the web routes are all under a dynamic
`[workspaceSlug]` segment, which the CLI skips.

## Generation

`pnpm bones:web` and `pnpm bones:admin` run the CLI against a dev server on
port 3000 and 4000 respectively. Every capture target is behind authentication,
so the CLI needs a session cookie: `ZIMBA_BONES_SESSION` for web and
`ZIMBA_BONES_ADMIN_SESSION` for admin, read from each app's `.env.local`. These
hold a developer's own dev session token — never a production session.

Generated `bones/` output is committed. The registry is a side-effect import in
each root layout and must resolve in production builds; a placeholder registry
is committed so that import resolves before the first capture run.

Re-run after any layout change — bones are a snapshot, and stale bones show the
old silhouette.

## Verification

- `pnpm typecheck` and Biome across the changed files.
- Both apps compile and serve with the registry import in place.
- Capture runs reach the configured routes and report per-name bone counts.
- With no bones for a name, the loading route still renders its placeholder.

## Deferred

- Capturing dynamic detail routes (`projects/[id]`, `users/[id]`, …).
- Replacing the remaining static placeholders on routes with no capture point.
