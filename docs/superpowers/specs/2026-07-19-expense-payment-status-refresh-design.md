# Expense payment status refresh

## Goal

After a payment is recorded for an expense or payable, the Expenses table must immediately show the status derived from that payment: `Not paid`, `Partially paid`, or `Paid in full`.

## Design

Payment records remain the source of truth. The table continues to derive each row's paid amount and status from ledger payments rather than storing a separately maintained UI status.

The payment service will identify whether the requested receipt ID belongs to an `expense` or a `payable` before creating the ledger entry. It will set exactly one matching foreign key (`expenseId` or `payableId`) and will update legacy expense status only for an expense record. This lets `listFinancialExpenseRows` find payments for both record types through their existing queries.

Every successful receipt-payment action will revalidate `/admin/expenses`, in addition to the currently connected pages. When the receipt detail client refreshes after the action, the Expenses table's next render reads the updated ledger totals.

## Error handling

If the supplied receipt ID resolves to neither record type, payment creation fails without writing a ledger entry. Existing amount and authorization validation remains unchanged.

## Verification

Add focused service tests covering a full payment for a payable and an expense, asserting the ledger foreign key and the status returned to the table. Run the web typecheck and relevant tests.
