# Mock and Live Data Mode Design

## Objective

Allow the dashboard to run against either the connected Zimba API or a fully isolated mock data repository. The mode is selected through a server-only environment variable so frontend teams can test complete read and write workflows without changing components or risking live business data.

## Configuration

The application will read `ZIMBA_DATA_MODE` on the server. Supported values are:

- `live`: use the existing Zimba API for dashboard business data and mutations.
- `mock`: use the mock repository for all dashboard business data and mutations.

Missing or invalid values resolve to `live`. This fail-closed default prevents deployments from silently using mock data. The variable is not prefixed with `NEXT_PUBLIC_`; client components will learn the active source only through their existing page data.

Better Auth, sessions, and organization membership remain live in both modes. A signed-in user with an organization is still required to access `/admin`.

## Architecture

### Mode configuration

A small server-only configuration module will parse and expose the active data mode. Environment-variable access will remain centralized in this module.

### Mock seed data

The existing dashboard fixtures will be consolidated into a dedicated mock seed module. It will include projects, project allocations, expenses, suppliers, upcoming payments, charts, team members, and company settings using the same domain types consumed by the UI.

### Mock repository

A server-only repository will clone the seed data into an in-memory workspace for each organization ID. Reads return cloned values so callers cannot mutate repository state accidentally. Mutations update only the active organization's workspace.

Repository state survives route navigation, cache revalidation, and server actions within one running application process. It intentionally resets when the development server or production process restarts. It is testing infrastructure, not durable storage.

### Data service routing

Dashboard read services and server actions will choose a provider based on the centralized mode:

- Mock mode obtains the authenticated organization ID, then calls the mock repository.
- Live mode follows the existing API client and normalization path unchanged.

Pages and presentation components will not branch on environment variables. Returned data will retain the existing `source: "api" | "mock"` contract.

## Read Coverage

Mock mode will provide data for:

- Dashboard overview and charts
- Project lists and project details
- Expense lists and project expense histories
- Supplier lists, profiles, and payment histories
- Budget, analytics, and reports derived from dashboard data
- Team and company settings fixtures
- Upcoming payment notifications

No Zimba API read may run while mock mode is active.

## Mutation Coverage

Mock mode will implement the same observable behavior as the current server actions:

- Create and update projects
- Update project allocations
- Create expense receipts
- Update expense payment status
- Create, update, and delete upcoming payments
- Create suppliers through the dashboard's current supplier workflow
- Simulate file-upload request and completion metadata without transferring file bytes

Successful mutations will keep the existing redirects, action result shapes, and route revalidation behavior. Validation remains shared with live actions where possible.

## Isolation and Safety

Mock workspaces are keyed by authenticated organization ID. Users in different organizations cannot see each other's mock changes. Live API functions are never used as fallback when a mock operation fails; mock failures return normal action errors.

The active mode should be visible through the dashboard's existing data-source indicator so testers can confirm they are not operating on live data.

## Error Handling

- Invalid `ZIMBA_DATA_MODE` values log a development warning and use live mode.
- Missing authenticated sessions or memberships continue to use the current auth errors and redirects.
- Unknown mock project, allocation, expense, or payment IDs return descriptive repository errors that server actions convert to their existing failure shape.
- Mock repository errors never trigger live API calls.

## Testing

Automated tests should cover:

- Parsing `mock`, `live`, missing, and invalid configuration values
- Seed cloning and reset behavior
- Organization-level isolation
- Mock project, allocation, expense, supplier, and payment mutations
- Derived totals after mutations
- Simulated upload results
- Dashboard services returning `source: "mock"`
- No API-client calls in mock mode
- Existing live provider behavior remaining unchanged

Verification will include type checking, linting, React diagnostics where React files change, and a production build in both configuration modes.

## Operational Use

For local testing, add this to `apps/web/.env.local` and restart the Next.js process:

```env
ZIMBA_DATA_MODE=mock
```

Switch back to the connected API with:

```env
ZIMBA_DATA_MODE=live
```

