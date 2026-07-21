# App subdomain routing design

## Goal

Keep the public marketing site at `https://zimba.digital` while making the authenticated dashboard available at the root of `https://app.zimba.digital`. The marketing site's **Sign in** action must send visitors to the app subdomain.

## Routing

Add the Next.js 16 project-level `proxy.ts` beside the `app` directory. For requests whose normalized hostname is `app.zimba.digital` and whose pathname is exactly `/`, internally rewrite the request to `/admin/home` with `NextResponse.rewrite`. Because this is a rewrite rather than a redirect, the browser address remains `https://app.zimba.digital`.

The proxy will not rewrite assets, API routes, authentication pages, or existing dashboard paths. Requests to `zimba.digital/` will continue to resolve to the existing marketing page. Existing dashboard navigation remains under `/admin/*` to avoid a broad route migration.

Hostname matching will tolerate an optional port so the rule can be tested locally. Preview deployment hostnames will retain the existing marketing-root behavior unless they explicitly use the production app hostname.

## Sign-in navigation

Change the marketing header's **Sign in** link from the relative `/login` path to `https://app.zimba.digital/login` in production. During local development, retain `/login` so developers do not get sent to production while testing the site.

Only the public marketing-header link changes. Authentication redirects and dashboard sign-out/error flows remain relative because they already execute within the app hostname and should continue to work in local and preview environments.

## Verification

Add focused tests for the hostname-routing decision and sign-in destination. Verify that:

- `app.zimba.digital/` rewrites to `/admin/home`.
- `zimba.digital/` is not rewritten.
- non-root app paths are not rewritten.
- host values with ports are normalized safely.
- production sign-in points to the app hostname and development sign-in stays local.

Run the web app's relevant tests, typecheck, and lint checks. No DNS, Vercel, GCP, authentication-provider, or database changes are included.
