# Supplier receipts table design

## Goal

Make the suppliers page an actionable receipt ledger. Users should be able to find a receipt, understand its payment state, and open it directly to clear or update payment details.

## UX

The main suppliers page keeps compact summary metrics, then presents one receipt-first TanStack table. Each row represents one receipt rather than one supplier.

Columns:

- Supplier name
- Receipt value
- Status
- Date and time

The table supports supplier/item search, status filtering, sortable columns, and responsive mobile cards. Each row is keyboard accessible and navigates to the existing receipt detail route. The row presents a clear affordance that it is actionable.

Status values are distinct:

- New: recently created receipt with no payment activity
- Pending: older receipt with no payment activity
- Partial: some payment recorded and a balance remains
- Paid in full: balance is zero

The data view model exposes receipt creation time so the New/Pending distinction is based on persisted data. The threshold is seven days, using the current date at render time.

Supplier detail remains focused on profile/contact information and supplier-level summary. Its payment breakdown and receipt/payment history sections are removed because the central receipt ledger is now the source of truth for receipt actions.

## Data flow

The dashboard expense query maps `created_at` into the client-safe `ExpenseTableRow` view model. A shared receipt-status resolver derives the display status from paid amount, receipt amount, and creation time. Existing payment status values remain unchanged for backend compatibility.

No new payment mutation is introduced. Receipt rows link to the existing receipt detail page, preserving the current payment/clear workflow and revalidation behavior.

## Implementation boundaries

- Replace the supplier-summary table data source with flattened receipt rows joined to supplier names.
- Use `@tanstack/react-table` with existing UI table primitives and responsive data-view patterns.
- Preserve supplier creation and summary statistics.
- Remove only duplicate payment breakdown/history UI from supplier detail.
- Add tests for receipt flattening and status derivation, plus typecheck/lint verification.

## Acceptance criteria

1. The suppliers page shows one row per receipt with the four requested fields.
2. New, Pending, Partial, and Paid in full are visually distinct and correctly derived.
3. Clicking or keyboard-activating a row opens that receipt's detail page.
4. Search, status filtering, and sorting work on the receipt table.
5. The supplier detail page no longer contains payment breakdown or receipt/payment history.
6. Existing payment actions continue to work from receipt detail.
