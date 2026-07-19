# Unify Payables in Expenses Design

## Goal

Show every incurred payable/obligation as a normal row in the main Expenses table. Obligations are no longer a user-facing section; their records and payment history remain stored in the payable model.

## Design

The expenses service will return a normalized `ExpenseTableRow[]` made from both current `expense` records and incurred `payable` records. Existing expense rows keep their current behavior. Payable rows will use their payable line items for description, allocation, and amount, and their linked ledger payments for paid and outstanding amounts. Rows will retain the payable ID so receipt detail and payment actions continue to resolve the original record.

The UI will render both sources identically. Any subtext identifying rows as legacy expenses will be removed. The obligations navigation and page remain removed.

## Data and error handling

- Scope both queries to the active organization.
- Include only payable records representing incurred expenses; exclude future or draft obligations.
- Preserve payment status from the payable amount and linked payments.
- Avoid copying or deleting records, preventing duplicates and preserving existing payment/audit relationships.
- If a payable has no line item, use a generic expense description and its gross amount.

## Verification

- Add service-level coverage for merged regular and payable rows.
- Verify organization isolation, row counts, amounts, payment statuses, and no duplicate IDs.
- Run typecheck, lint, and tests.
