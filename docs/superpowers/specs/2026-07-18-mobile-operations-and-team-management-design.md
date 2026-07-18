# Mobile operations and team management design

**Date:** 2026-07-18
**Application:** `apps/web`

## Goal

Turn the successful Zimba demo feedback into reliable phone-first workflows for receipts, supplier ledgers, project administration, and team access. Preserve financial accuracy, recover interrupted work, and enforce every permission in the server-side domain services.

## Delivery sequence

Implement continuously in three independently verifiable releases:

1. Mobile financial reliability
2. Project administration
3. Team invitations and roles

Each release includes its schema migration, services, Server Actions, mobile UI, authorization, audit records, and automated tests.

## Release 1: mobile financial reliability

### Full-payment shortcut

Receipt details expose `Mark fully paid` when a balance remains and retain `Record custom payment` for partial payments. Full payment requires confirmation and creates a ledger payment for the exact current outstanding balance. The service runs in a transaction, rechecks the balance, and uses an idempotency key to prevent duplicate payments from retries or double taps.

### Exact money display

Create one reusable money-display component. Compact layouts may abbreviate large values, but the exact formatted value must be available through pointer hover, keyboard focus, and tap. Mobile users must never depend on hover. Forms and confirmation dialogs always display exact, unrounded values.

### Supplier ledger correctness

Replace derived or estimated supplier payment values with PostgreSQL aggregation over expense lines and ledger payments. Supplier detail pages show every receipt, project, date, line item, receipt value, paid amount, outstanding amount, payment status, and linked receipt file. All queries are scoped to the active organization.

### Interruption recovery

Store unfinished receipt workflows in IndexedDB, including form fields, line items, project and supplier selection, selected receipt `Blob`, upload state, and completed uploaded-file ID. Draft identity includes user, organization, project, and workflow. Restore automatically after reload, browser closure, or phone interruption; show a clear restored-draft notice and a `Discard draft` action. Drafts expire after seven days and clear only after successful persistence or explicit discard. Reuse completed uploads rather than uploading the same file again.

### Print and share

Receipt details provide `Print` and `Share`. Print uses a receipt-specific stylesheet without dashboard chrome. Share uses the Web Share API on supported phones and falls back to copying the authenticated receipt URL. Storage object URLs remain access-controlled and are not treated as public share links.

## Release 2: project administration

### Edit project details

Owners and site managers can edit project name, client, location, land/plot size, building type, start date, target completion date, and status. Reuse project creation fields and Zod rules. The service validates organization ownership and writes an audit event containing actor, timestamp, and changed fields.

### Edit allocation budgets

Owners and site managers can rename allocations and change their budgets. The form shows exact current and proposed amounts. A budget below recorded spending produces an over-budget warning and requires explicit owner confirmation; a site manager cannot force that condition. Project budget, remaining amount, and utilization continue to derive from allocations and expense lines. Audit records contain old and new values.

### Archive and restore projects

Owners can archive a project after a strong mobile confirmation. Archiving preserves allocations, expenses, payments, suppliers, files, and audit history. Archived projects are excluded from active dashboards and mutation selectors, appear in an owner-only archived filter, and can be restored. All ordinary mutations reject archived projects. No physical project deletion is exposed.

## Release 3: team invitations and roles

### Invitation workflow

Owners and site managers invite by name, email, role, optional project assignments, and responsibility. Invitations use a cryptographically random single-use token, expire after seven days, and store only a hash of the token. Creating a replacement invalidates older pending invitations for that organization and email. The UI supports copy link and native mobile share.

After Better Auth sign-in, the acceptance flow verifies the token, email, expiry, requested role, inviter authority, and organization. It creates membership and assignments transactionally and marks the invitation accepted.

### Permission model

- Owner: full workspace control, member roles, project archive/restore, budgets, receipts, and payments.
- Site manager: project operations, suppliers, receipts, payments, and invitations for site managers, accountants, or viewers.
- Accountant: receipts, supplier payments, payment status, and reports.
- Viewer: read-only.

No user may grant authority above their own. The final owner cannot be removed or demoted. Services and Server Actions enforce permissions independently of UI visibility.

### Team management

The Team route becomes database-backed and shows active members plus pending/expired invitations. Authorized users can copy/share or replace an invitation, revoke it, change permitted roles and project assignments, and remove a member after confirmation.

## Shared data and safety

- Continue storing money as integer cents using PostgreSQL `bigint` and JavaScript numbers only while values remain within `Number.MAX_SAFE_INTEGER`.
- Add audit records for payments, project edits, budget edits, archive/restore, invitations, membership changes, and role changes.
- Validate all untrusted input with Zod.
- Scope every repository query by organization and check resource ownership in services.
- Use transactions for payment completion, receipt creation, invitations, and membership changes.
- Reject stale or duplicate mutations with stable domain errors and client-safe action results.
- Provide at least 44px touch targets, visible pending states, retry-safe controls, and accessible confirmation dialogs.

## Testing and acceptance

- Full-payment action records the exact outstanding amount once, including under duplicate taps.
- Compact money values expose exact values by hover, focus, and tap.
- Supplier totals equal expense-line totals minus real ledger payments.
- Receipt drafts and selected files restore after reload and clear after success/discard/expiry.
- Completed uploads resume without duplicate transfer.
- Print output excludes application chrome; share uses Web Share or copy fallback.
- Owners and site managers can perform only their documented project operations.
- Archived projects remain readable, disappear from active workflows, reject mutations, and restore safely.
- Invitations enforce expiry, email, role ceiling, single use, and final-owner protection.
- Mobile end-to-end tests cover narrow screens, interruption recovery, offline/retry transitions, and confirmation flows.
- TypeScript, tests, lint, production build, migrations, and React Doctor complete without errors.

## Explicit decisions

- Use IndexedDB rather than local/session storage for receipt drafts because file blobs must survive interruption.
- Draft retention is seven days.
- Use copyable/shareable invite links; transactional email is outside this release.
- Archive projects instead of deleting them.
- Deliver as three vertical releases rather than one unreviewable cutover.
