# Temporary Authentication Bypass Design

## Objective

Allow the dashboard to be tested through a temporary public tunnel while the authentication provider's redirect URLs and allowed origins are not yet configured. The bypass must never expose connected business data.

## Configuration

The server-only `ZIMBA_AUTH_MODE` environment variable accepts:

- `live`: require Better Auth and organization membership as normal.
- `bypass`: use a fixed test identity without calling Better Auth or the organization database.

Missing or invalid values resolve to `live`.

Authentication bypass is effective only when `ZIMBA_DATA_MODE=mock`. If bypass is requested while data mode is `live`, the application logs a warning and uses live authentication. This invariant prevents an unauthenticated ngrok tunnel from reaching the connected Zimba API.

## Bypass Identity

The temporary identity is server-defined and contains:

- Name: `Mobile Tester`
- Organization: `Mock Workspace`
- Role: `owner`
- Organization ID: `mock-mobile-workspace`

The fixed organization ID scopes all reads and mutations to one mock repository workspace for the running process.

## Access Flow

### Admin layout

When the gated bypass is active, the admin layout skips session and membership queries and supplies the fixed identity to `WorkspaceProvider`. Sidebar state and all dashboard rendering continue normally.

When bypass is inactive, the existing login and onboarding redirects remain unchanged.

### Dashboard data and actions

The server API-session helper returns the fixed mock organization session when the gated bypass is active. Existing dashboard services and server actions therefore continue using the organization-scoped mock repository without component-specific branches.

The mock session must never contain or imitate a live API token. Live API functions remain unreachable because gated bypass requires mock data mode.

### Mode visibility

The dashboard top bar displays an `Auth bypass` indicator next to the existing `Mock data` indicator. This makes the temporary security state visible on desktop and mobile screens.

## Safety Behavior

- `ZIMBA_AUTH_MODE=bypass` plus `ZIMBA_DATA_MODE=mock`: bypass is active.
- `ZIMBA_AUTH_MODE=bypass` plus `ZIMBA_DATA_MODE=live`: bypass is rejected and normal authentication is required.
- Missing or invalid auth mode: normal authentication is required.
- Disabling bypass requires changing one environment value and restarting the Next.js process.

The bypass setting is server-only and is never included in client JavaScript.

## Testing

Verification will cover:

- Auth-mode parsing for valid, missing, and invalid values
- The bypass/data-mode safety matrix
- Admin rendering without Better Auth in gated bypass mode
- Mock dashboard reads and mutations using the fixed organization ID
- Normal login redirects in live auth mode
- Rejection of bypass when live data mode is selected
- Visible bypass status in the dashboard shell
- Type checking, linting, React diagnostics, and production builds

## Temporary Local Configuration

Phone testing through ngrok uses:

```env
ZIMBA_DATA_MODE=mock
ZIMBA_AUTH_MODE=bypass
```

Restore normal authentication with:

```env
ZIMBA_AUTH_MODE=live
```

