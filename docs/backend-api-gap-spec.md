# Zimba frontend API gap specification

**Prepared:** 2026-07-14  
**Frontend reviewed:** `apps/web`  
**Current backend contract:** [OpenAPI](https://zimba-backend-779644650318.us-central1.run.app/openapi.json)

## Goal

Replace the frontend's mock data and browser storage with organization-scoped APIs for projects, allocations, expenses, suppliers, dashboard reporting, team access, settings, and notifications.

The current API has these implemented endpoints:

| Endpoint | State | Frontend gap |
| --- | --- | --- |
| `GET/POST /api/v1/projects` | Partial | Project creation fields and list metadata are incomplete. No pagination/filtering. |
| `GET /api/v1/projects/{project_id}` | Partial | Has task/expense/supplier breakdown, but the web app does not yet call it. Missing project metadata and planned payments. |
| `GET/POST /api/v1/expenses` | Partial | Missing project name, payment status, receipt data, pagination and atomic multi-line receipt creation. |
| `GET /api/v1/suppliers` | Partial | Response is untyped in OpenAPI and its time period is undefined. Authentication is inconsistent. |

`/` is only a health/root response and does not serve frontend data.

## Cross-cutting contract requirements

1. All business endpoints must require both `Authorization: Bearer <token>` and `X-Organization-Id: <organization-id>`. The backend must authorize that the user belongs to the specified organization. Header casing should be treated case-insensitively.
2. Use ISO 8601 dates (`YYYY-MM-DD`) and UTC ISO timestamps for `created_at`/`updated_at`.
3. All monetary values are integer minor units in the organization currency. For the current UI this means whole UGX; no floating-point money.
4. Use stable, lower-case API enums. The UI may display them as `Full`, `Partial`, and `Not paid`, but the API should use `paid`, `partially_paid`, and `unpaid`.
5. List endpoints should return the common envelope below and accept `page`, `page_size`, `search`, `sort_by`, and `sort_order` where applicable. Existing unpaginated endpoints may remain temporarily for compatibility, but the frontend integration should target the envelope.

```json
{
  "items": [],
  "page": 1,
  "page_size": 25,
  "total": 0
}
```

6. Return `201` for creates, `204` for successful deletes, `401` for a missing/invalid token, `403` for an inaccessible organization/resource, `404` for a missing scoped resource, `409` for a business conflict, and FastAPI `422` validation responses for invalid input.
7. API-calculated totals (`budget`, `spent`, `remaining`, `utilization_pct`) are authoritative. Do not trust totals sent by the client.

## P0 — required to connect the current project and expense flows

### 1. Projects and initial allocation

#### Upgrade `POST /api/v1/projects`

The current `tasks: object[]` field is too loose and the UI currently stores the created project in `localStorage`. Create the project and its opening allocation atomically.

```json
{
  "name": "Kironde Road Apartments",
  "location": "Kololo, Kampala",
  "land_size": "2.5 acres",
  "building_type": "residential",
  "client_name": "Zimba Developments",
  "start_date": "2026-08-01",
  "target_end_date": "2027-05-31",
  "attachment_ids": ["file_01J..."],
  "allocations": [
    { "name": "Land", "budget": 100000000 },
    { "name": "Labour", "budget": 180000000 },
    { "name": "Materials", "budget": 240000000 }
  ]
}
```

Required: `name`, `location`, `land_size`, `building_type`, and a non-empty `allocations` list. Each allocation needs a unique non-blank name and `budget > 0`. The response is the full `ProjectDetail` object below.

`building_type` enum: `residential`, `commercial`, `mixed_use`, `industrial`, `other`.

#### Upgrade `GET /api/v1/projects`

Support: `search`, `status`, `page`, `page_size`, `sort_by` (`name`, `created_at`, `budget`, `utilization_pct`) and `sort_order` (`asc`, `desc`). Return `ProjectSummary` objects.

```json
{
  "id": 42,
  "name": "Kironde Road Apartments",
  "location": "Kololo, Kampala",
  "land_size": "2.5 acres",
  "building_type": "residential",
  "client_name": "Zimba Developments",
  "status": "on_track",
  "start_date": "2026-08-01",
  "target_end_date": "2027-05-31",
  "currency": "UGX",
  "budget": 520000000,
  "spent": 0,
  "remaining": 520000000,
  "utilization_pct": 0,
  "created_at": "2026-07-14T07:00:00Z",
  "updated_at": "2026-07-14T07:00:00Z"
}
```

`status` enum: `draft`, `on_track`, `at_risk`, `over_budget`, `completed`, `archived`. This removes the frontend's hard-coded client, timeline, and status map.

#### Upgrade `GET /api/v1/projects/{project_id}`

Return the project summary plus `allocations`, recent `expenses`, supplier totals, and `upcoming_payments`. The current detail response calls allocations `tasks`; the API should either rename it to `allocations` or return both during migration. Prefer the following response:

```json
{
  "...ProjectSummary": "all fields above",
  "allocations": [
    {
      "id": 7,
      "name": "Materials",
      "budget": 240000000,
      "spent": 18400000,
      "remaining": 221600000,
      "utilization_pct": 8
    }
  ],
  "suppliers": [
    { "supplier_id": 5, "name": "Prime Cement", "amount": 18400000 }
  ],
  "expenses": { "items": [], "page": 1, "page_size": 25, "total": 0 },
  "upcoming_payments": []
}
```

Add `PATCH /api/v1/projects/{project_id}` for editable metadata and `PATCH /api/v1/projects/{project_id}/allocations/{allocation_id}` for an allocation name/budget. These controls are not yet wired, but avoid another breaking API revision when project editing is enabled.

### 2. Expense receipts and payment status

The current UI creates a receipt containing **one or more line items**, each assigned to an allocation/task and supplier. The existing `POST /expenses` only accepts one item, does not persist payment status, and cannot safely make the whole receipt atomic.

#### New `POST /api/v1/projects/{project_id}/expense-receipts`

Create all line items in one transaction. A failed item fails the receipt; no partial writes.

```json
{
  "expense_date": "2026-07-14",
  "payment_status": "paid",
  "receipt_file_id": "file_01J...",
  "items": [
    {
      "allocation_id": 7,
      "supplier_name": "Prime Cement",
      "item_description": "Cement, 50 bags",
      "quantity": 50,
      "unit_rate": 368000
    },
    {
      "allocation_id": 8,
      "supplier_name": "Cash / labour",
      "item_description": "Masonry team payout",
      "quantity": 1,
      "unit_rate": 9800000
    }
  ]
}
```

`amount` is calculated as `quantity * unit_rate`; accept a client `amount` only as a validation check if needed. A supplier name may create or match a supplier inside the organization. Return `201` with the receipt and all created expense lines.

#### Upgrade `GET /api/v1/expenses`

Support `project_id`, `allocation_id`, `supplier_id`, `payment_status`, `date_from`, `date_to`, `search`, pagination, and sorting. Each item must include fields needed by the global expense table:

```json
{
  "id": 115,
  "receipt_id": 31,
  "project_id": 42,
  "project_name": "Kironde Road Apartments",
  "allocation_id": 7,
  "allocation_name": "Materials",
  "supplier": { "id": 5, "name": "Prime Cement" },
  "item_description": "Cement, 50 bags",
  "quantity": 50,
  "unit_rate": 368000,
  "amount": 18400000,
  "currency": "UGX",
  "expense_date": "2026-07-14",
  "payment_status": "paid",
  "receipt_file": { "id": "file_01J...", "url": "https://..." },
  "created_at": "2026-07-14T07:00:00Z",
  "updated_at": "2026-07-14T07:00:00Z"
}
```

Keep the existing `task_name`, `supplier_name`, and `date` response aliases only during migration. The frontend should move to `allocation_name`, `supplier.name`, and `expense_date`.

#### New `PATCH /api/v1/expenses/{expense_id}`

Required immediately for the payment-status selector on the project detail screen.

```json
{ "payment_status": "partially_paid" }
```

Permit payment-status changes and documented editable fields; reject edits that would move an expense outside its organization or assigned project. Return the updated expense line and recalculated project/allocation totals.

The existing `POST /api/v1/expenses` may remain as a legacy single-line convenience endpoint. It must at minimum add `payment_status` and return the richer expense shape above.

### 3. File upload for project attachments and receipts

The UI accepts project attachments and has a receipt URL field in the existing API model, but there is no upload contract. Use object storage with presigned uploads:

1. `POST /api/v1/files/upload-url` accepts `{ "filename", "content_type", "size_bytes", "purpose" }`, where purpose is `project_attachment` or `expense_receipt`.
2. Return `{ "file_id", "upload_url", "headers", "expires_at" }`.
3. Client uploads directly to storage, then calls `POST /api/v1/files/{file_id}/complete`.
4. Return `{ "id", "filename", "content_type", "size_bytes", "url" }`; only authorized organization users may retrieve the URL.

Validate allowed types and file sizes server-side. Project creation and receipt creation reference only completed file IDs.

### 4. Planned/upcoming payments

The project detail header currently displays hard-coded planned payments and has a form to add one. Implement:

- `GET /api/v1/projects/{project_id}/upcoming-payments?status=planned&page=1&page_size=25`
- `POST /api/v1/projects/{project_id}/upcoming-payments`
- `PATCH /api/v1/projects/{project_id}/upcoming-payments/{payment_id}`
- `DELETE /api/v1/projects/{project_id}/upcoming-payments/{payment_id}`

Create body:

```json
{
  "title": "Cement delivery",
  "description": "50 bags of cement",
  "supplier_name": "Prime Cement",
  "amount": 15000000,
  "currency": "UGX",
  "due_date": "2026-07-28"
}
```

Status enum: `planned`, `due`, `overdue`, `cancelled`, `converted_to_expense`.

## P1 — required for real dashboard, suppliers, analytics, and reports

### 5. Dashboard and analytics

The frontend currently derives cards from all projects and expenses, but its charts are placeholders: project names are used as months and utilization is not a true time series. Add:

`GET /api/v1/dashboard/overview?date_from=2026-07-01&date_to=2026-07-31&project_id=42`

```json
{
  "currency": "UGX",
  "totals": {
    "active_projects": 3,
    "budget": 1420000000,
    "spent": 897000000,
    "remaining": 523000000,
    "utilization_pct": 63
  },
  "spend_by_period": [
    { "period": "2026-07", "budget": 200000000, "spent": 190000000 }
  ],
  "utilization_by_period": [
    { "period": "2026-07", "utilization_pct": 63 }
  ],
  "recent_expenses": { "items": [], "page": 1, "page_size": 10, "total": 0 },
  "budget_risks": { "items": [], "page": 1, "page_size": 10, "total": 0 }
}
```

### 6. Suppliers

Upgrade `GET /api/v1/suppliers` to require bearer authentication and publish a concrete schema. Support `search`, `category`, `date_from`, `date_to`, pagination, and sorting.

```json
{
  "id": 5,
  "name": "Prime Cement",
  "category": "materials",
  "payment_count": 8,
  "paid_amount": 64000000,
  "outstanding_amount": 0,
  "currency": "UGX",
  "status": "active"
}
```

Categories: `materials`, `labour`, `equipment`, `services`, `other`. `paid_amount` must respect the selected date range; the current page labels it “Paid this month.” Add `GET /api/v1/suppliers/{supplier_id}` with linked expense history when the supplier detail view is built. Supplier creation/editing is not yet a frontend requirement.

### 7. Reports and exports

The Reports and Analytics pages show project-level performance and each has an export action. Add:

- `GET /api/v1/reports/project-budget?date_from&date_to&project_id&page&page_size`
- `POST /api/v1/exports` with `{ "report_type": "project_budget" | "analytics", "format": "csv" | "xlsx" | "pdf", "date_from", "date_to", "project_id" }`
- `GET /api/v1/exports/{export_id}` returning `status` (`queued`, `processing`, `completed`, `failed`) and a short-lived `download_url` once complete.

The report rows can reuse `ProjectSummary`; include project status and date range in every export.

## P2 — screens currently entirely mocked

### 8. Team and roles

Required for the Team page and “Invite member” button:

- `GET /api/v1/organization/members?search&page&page_size`
- `POST /api/v1/organization/invitations`
- `PATCH /api/v1/organization/members/{member_id}`
- `DELETE /api/v1/organization/members/{member_id}`

Member response:

```json
{
  "id": "usr_...",
  "name": "Amina Kato",
  "email": "amina@example.com",
  "role": "site_manager",
  "responsibility": "Logs site expenses",
  "status": "active",
  "project_ids": [42]
}
```

Roles: `owner`, `admin`, `accountant`, `site_manager`, `viewer`. Backend authorization must enforce role permissions, not merely drive UI visibility.

### 9. Organization settings and notification preferences

- `GET /api/v1/organization/settings`
- `PATCH /api/v1/organization/settings`
- `GET /api/v1/organization/notification-preferences`
- `PATCH /api/v1/organization/notification-preferences`
- `GET /api/v1/notifications?status=unread&page&page_size`
- `PATCH /api/v1/notifications/{notification_id}` with `{ "read": true }`

Settings body:

```json
{
  "company_name": "Zimba Consultants",
  "currency": "UGX",
  "default_region": "Kampala",
  "fiscal_period": "monthly",
  "budget_risk_threshold_pct": 80,
  "pending_approval_alert_after_hours": 24,
  "weekly_report_enabled": true
}
```

### 10. Authentication bootstrap

The login form is currently presentation-only and redirects directly to the dashboard. The backend already expects a bearer session token and organization header, but the frontend has no supported way to obtain either.

If the team is not using an external authentication API/SDK, provide:

- `POST /api/v1/auth/email/start` (email sign-in/magic-link start)
- `POST /api/v1/auth/google/start` and callback route, or a documented Google token exchange
- `GET /api/v1/auth/session` returning the current user, token expiry, organization memberships, and active organization
- `POST /api/v1/auth/logout`

At minimum, document the existing identity provider's session-token format, refresh strategy, and how the frontend obtains/selects an organization ID. Never place a long-lived service token in `ZIMBA_API_SESSION_TOKEN`; that is only acceptable for temporary server-side development.

## Migration order and acceptance criteria

1. **P0 projects and receipts:** The frontend can create a project, refresh the browser, open its real detail page, record a multi-line receipt, and update its payment status without `localStorage`.
2. **P0 uploads and upcoming payments:** Attachments and receipt files survive refresh and are access-controlled; planned payments persist.
3. **P1 read models:** Dashboard, expenses, suppliers, analytics, and reports use real filtered/paginated data and actual monthly series.
4. **P2 administration and auth:** Team/settings/notifications and real login remove the final mocked screens.

Before merging the backend work, update the deployed OpenAPI document so every response has a concrete schema—especially `GET /api/v1/suppliers`—and add integration tests proving organization isolation, calculated total correctness, and atomic receipt creation.
