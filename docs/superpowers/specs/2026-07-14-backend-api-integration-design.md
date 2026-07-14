# Backend API integration design

**Date:** 2026-07-14  
**Frontend:** `apps/web`  
**Backend:** `https://zimba-backend-779644650318.us-central1.run.app`  
**Contract:** `https://zimba-backend-779644650318.us-central1.run.app/openapi.json`

## Goal

Connect the existing Next.js frontend to every business endpoint currently exposed by the Zimba backend. Preserve the current interface, replace browser-only mock persistence where a real endpoint exists, keep backend credentials server-side, and make API failures visible rather than silently substituting plausible mock data.

The integration covers projects, allocations, project details, expenses, multi-line expense receipts, expense payment status, suppliers, file uploads, upcoming payments, and the dashboard overview. Team, settings, supplier creation, reports, and exports remain locally backed or unavailable because the current OpenAPI contract does not expose those operations.

## Runtime configuration and authentication

The frontend reads these server-only environment variables:

- `ZIMBA_API_BASE_URL` — backend origin, set to `https://zimba-backend-779644650318.us-central1.run.app`.
- `ZIMBA_API_SESSION_TOKEN` — bearer token accepted by the backend.
- `ZIMBA_ORGANIZATION_ID` — organization identifier sent with every business request.

None of these variables use the `NEXT_PUBLIC_` prefix. The API client sends `Authorization: Bearer <token>` and `X-Organization-Id: <organization-id>` once per request. It does not duplicate the organization header with alternate casing.

The current login page is mocked, so this iteration uses the configured server session. Replacing it with user-specific authentication is a separate feature. When the token or organization ID is missing, pages may use the existing mock fixtures for local UI development and must label the data source as mock. When a configured API request fails, the application shows an error state; it does not silently fall back to mock data.

## Architecture

### Contract types

`apps/web/lib/types.ts` is updated to reflect the current OpenAPI shapes. API enums use the backend values, including `paid`, `partially_paid`, and `unpaid`. Presentation helpers convert these to the existing labels `Full`, `Partial`, and `Not paid` at the UI boundary.

Paginated projects and expenses use the common `{ items, page, page_size, total }` envelope. Project data uses `allocations` and `utilization_pct` as canonical fields. Compatibility fields such as `tasks`, `pct`, `task_name`, and `date` are normalized in one adapter rather than spread across components.

### Server-only API client

`apps/web/lib/api/client.ts` remains the single low-level transport. It is responsible for:

- resolving paths against `ZIMBA_API_BASE_URL`;
- attaching the configured authentication and organization headers;
- serializing query parameters and JSON request bodies;
- supporting `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`;
- returning `undefined` for successful `204 No Content` responses;
- parsing FastAPI validation errors and useful non-validation error messages;
- preventing malformed base URLs or missing configuration from producing ambiguous failures; and
- using `cache: "no-store"` for authenticated operational data.

Endpoint functions remain small and typed. They expose project, expense, supplier, file, upcoming-payment, and dashboard operations without leaking fetch details into pages or components.

### Read adapters

Server components call feature-level read adapters:

- dashboard, analytics, reports, and budget pages use `GET /api/v1/dashboard/overview` for authoritative totals and time-series data;
- project lists use `GET /api/v1/projects` and unwrap the pagination envelope;
- project detail and new-expense pages use `GET /api/v1/projects/{project_id}`;
- the global expense view uses `GET /api/v1/expenses`;
- supplier views use `GET /api/v1/suppliers`, with supplier detail derived from the supplier record and filtered expenses because no supplier-detail endpoint exists.

Adapters map backend records into the narrow view models consumed by existing components. Derived fields are limited to display concerns. Backend totals remain authoritative.

### Mutations

Client components invoke server actions for mutations so credentials never reach the browser. Actions validate and normalize submitted values, call the typed client, return a structured success/error result, and revalidate affected routes.

The mutation mapping is:

- project creation → `POST /api/v1/projects`;
- project metadata update → `PATCH /api/v1/projects/{project_id}`;
- allocation update → `PATCH /api/v1/projects/{project_id}/allocations/{allocation_id}`;
- multi-line expense creation → `POST /api/v1/projects/{project_id}/expense-receipts`;
- legacy single expense creation, where still needed → `POST /api/v1/expenses`;
- expense payment status → `PATCH /api/v1/expenses/{expense_id}`;
- upcoming payment list/create/update/delete → the project upcoming-payment endpoints;
- file request/complete → `POST /api/v1/files/upload-url` and `POST /api/v1/files/{file_id}/complete`.

After project creation, the action redirects to the created project. After receipt creation, it redirects to the project detail page. Inline edits remain on the current page and refresh server data after success.

## File upload flow

File uploads use the backend's three-step contract:

1. A server action requests an upload URL with filename, MIME type, size, and purpose.
2. The browser uploads the raw file to the returned `upload_url` using the returned headers. The returned URL may point at the backend direct-upload endpoint or external object storage and is treated as opaque.
3. A server action completes the file and returns its file ID. Project or receipt creation sends only completed file IDs.

The UI rejects empty files and surfaces backend type or size validation. Project creation supports its existing attachment input. Expense receipt creation gains a receipt attachment without requiring a public URL field.

## UI behavior

The visual layout remains unchanged except where API state requires feedback. Forms gain pending states, prevent duplicate submission, and display field or form errors. Pages render meaningful empty states for zero projects, expenses, suppliers, or upcoming payments.

Browser storage is no longer used as the source of truth for connected resources:

- the project creation session draft may remain in `sessionStorage` until submission because it is transient form state;
- stored projects, stored expenses, stored expense statuses, and stored suppliers are removed from connected flows;
- mock fixtures remain only for development without configured session credentials and for unsupported screens.

The project detail view uses real allocations, expenses, suppliers, and upcoming payments. Expense rows use stable IDs for status updates. Supplier names can still be entered through the receipt flow as allowed by the backend contract.

## Error handling

Transport errors, authentication failures, forbidden organization access, missing resources, conflicts, and validation failures are distinguished. Validation details are converted into concise form messages. Pages use an explicit error boundary or page-level error state for failed reads. Mutations preserve user input on failure.

The API client never logs bearer tokens or organization identifiers. User-visible messages avoid exposing raw response bodies. Unexpected errors retain enough server-side context for development logs while the UI receives a generic retry message.

## Backend compatibility constraints

The live OpenAPI document is authoritative for implementation. Current notable constraints are:

- all business endpoints require the bearer and organization headers;
- project and expense lists are paginated envelopes;
- suppliers and upcoming payments currently return arrays;
- project details return both `allocations` and legacy `tasks`;
- expense responses include canonical fields plus legacy aliases;
- `DELETE` upcoming payment returns `204` with no JSON body;
- no team, settings, reports, exports, supplier-create, or supplier-detail endpoints currently exist.

The integration must not invent network calls for unsupported features.

## Verification

Static verification includes Biome checks, TypeScript type checking, and a production Next.js build. React changes are reviewed with React Doctor after implementation.

Runtime verification uses the configured environment and covers:

1. load dashboard totals and time-series data;
2. list projects and open a project detail page;
3. create a project with multiple allocations and an optional attachment;
4. create a multi-line expense receipt with an optional receipt file;
5. update an expense payment status and confirm recalculated data appears;
6. create, update, filter, and delete an upcoming payment;
7. load global expenses and suppliers; and
8. confirm configured API failures show errors instead of mock data.

If valid session credentials are unavailable locally, authenticated runtime calls cannot be claimed as verified. In that case, transport behavior is tested with deterministic mocked fetch responses and the missing credential requirement is reported explicitly.

## Out of scope

- implementing real end-user login or token refresh;
- adding backend endpoints absent from the OpenAPI contract;
- redesigning existing screens;
- replacing the backend's authorization model; and
- implementing team, organization settings, notification, report-export, or supplier-management mutations.
