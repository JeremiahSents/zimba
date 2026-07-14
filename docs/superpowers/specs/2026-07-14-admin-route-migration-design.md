# Admin route migration design

## Goal

Move the authenticated dashboard from the `dashboard` URL namespace to `admin`. The dashboard landing page becomes `/admin/home`, while its feature pages retain their existing suffixes beneath `/admin`.

## Route structure

The App Router route directory changes from `apps/web/app/dashboard` to `apps/web/app/admin`.

| Existing URL | New URL |
| --- | --- |
| `/dashboard` | `/admin/home` |
| `/dashboard/projects` | `/admin/projects` |
| `/dashboard/projects/new` | `/admin/projects/new` |
| `/dashboard/projects/[id]` | `/admin/projects/[id]` |
| `/dashboard/budget` | `/admin/budget` |
| `/dashboard/expenses` | `/admin/expenses` |
| `/dashboard/suppliers` | `/admin/suppliers` |
| `/dashboard/team` | `/admin/team` |
| `/dashboard/analytics` | `/admin/analytics` |
| `/dashboard/reports` | `/admin/reports` |
| `/dashboard/settings` | `/admin/settings` |

`/admin` has no page. It therefore returns the standard Next.js 404, as do all former `/dashboard/...` paths. No redirects, rewrites, proxy rules, or compatibility route files are added.

## Implementation boundaries

- Relocate route files only; keep the existing dashboard components, data loading, and metadata behavior otherwise unchanged.
- Update every application-owned URL consumer: navigation/sidebar links, `Link` targets, forms, programmatic navigation, breadcrumbs, and mock-data links.
- Update existing route documentation that describes active URLs if it is part of the route migration scope; historical design specifications remain unchanged.
- Do not change UI styling, API behavior, authentication, or domain/subdomain configuration.

## Verification

- Search the web application for stale `/dashboard` URLs and leave none in executable application code.
- Run the web TypeScript check and production build.
- Confirm the generated routes include `/admin/home` and the moved feature paths, and do not include `/dashboard` routes.
