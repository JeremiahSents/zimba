import { describe, expect, it } from "vitest"

import { getSupplierLedger, getSupplierListItems } from "./supplier-data"
import type { ExpenseTableRow, SupplierResponse } from "./types"

describe("supplier data helpers", () => {
  it("uses supplier ids and persisted financial totals for ledger numbers", () => {
    const suppliers: SupplierResponse[] = [
      {
        id: "supplier-1",
        supplier_id: "supplier-1",
        name: "Sents Inc",
        category: "materials",
        payments: 1,
        amount: 0,
        total_incurred: 1200,
        total_paid: 450,
      },
    ]
    const expenses: ExpenseTableRow[] = [
      {
        id: "expense-1",
        receipt_id: "expense-1",
        project_id: "project-1",
        supplier_id: "supplier-1",
        date: "2026-07-18T00:00:00.000Z",
        task_name: "Materials",
        supplier_name: "Different display name",
        item_description: "Cement",
        amount: 1200,
        paid_amount: 450,
        outstanding_amount: 750,
        project_name: "Site A",
        status: "Partial",
      },
    ]

    const [supplier] = getSupplierListItems(suppliers, expenses)
    const ledger = getSupplierLedger(suppliers[0]!, expenses)

    expect(supplier).toMatchObject({
      amount: 1200,
      paid: 450,
      remaining: 750,
      statusSummary: { Full: 0, Partial: 1, "Not paid": 0 },
    })
    expect(ledger).toHaveLength(1)
    expect(ledger[0]).toMatchObject({ receiptValue: 1200, paid: 450, remaining: 750 })
  })
})
