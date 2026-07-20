# Finance data and supplier UX repair

## Goal

Restore trustworthy receipt categories and attachments, make receipt details canonical pages, turn suppliers into a supplier-first experience, and improve the project category-budget editor.

## Category integrity

Allocation-backed `expense_line` records retain their stored allocation and resolve their name from the allocation tables. Legacy `payable` records without an allocation are represented as **Uncategorized**, never as General. The receipt list, project views, supplier views, and receipt detail all carry explicit category state.

Authorized financial managers can use a receipt action menu to correct a receipt category or delete a receipt after confirmation. Correcting an allocation-less legacy payable creates a compatible expense and one expense line linked to the chosen project allocation; the original payable remains intact. The feature must not infer an allocation from item text. A read-only audit reports allocation-backed, allocation-less payable, and missing-allocation records.

## Receipt details and files

`/admin/expenses/receipts/[id]` is the only receipt detail route. Intercepting receipt-modal routes are removed. The receipt detail query resolves `expense.receiptFileId` via the `file` table and exposes receipt attachment metadata. The page renders image previews and document links, with unavailable and empty states.

Legacy recovery is audit-first. A report inventories `uploaded_file`/`file`, expense file references, document links, and project attachments. No legacy import runs without an accessible, verified source and a dry-run, idempotent repair path.

## Suppliers

The suppliers index is a searchable responsive card grid with one card per supplier and aggregate receipt count, incurred value, paid value, outstanding value, latest receipt date, and contact summary. Supplier detail uses a stable supplier ID route, presents summary/contact information and a TanStack receipt table, and links receipts to the canonical receipt page.

Supplier edits cover name, category, contact data, optional email, notes, and status. Empty email is stored as null; non-empty email is validated. Mutations use existing auth, role, audit, and route revalidation patterns.

## Project edit experience

Project budget remains the sum of allocation budgets. The existing project editor becomes a wider responsive form with grouped project details, dates/status, attachments, and readable allocation rows. Each allocation row shows its budget and current spend/remaining amount. Invalid numeric budgets are rejected, and connected project/budget views refresh after save.

## Verification

Tests cover category state and correction, receipt attachment mapping and direct navigation, supplier aggregation and optional-email validation, supplier receipt filtering, and allocation-budget validation. Run the web typecheck, lint, focused tests, and production build.
