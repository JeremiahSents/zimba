import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  listExpensesForOrganization: vi.fn(),
  listPayablesForOrganization: vi.fn(),
  listPayablePaymentsForPayables: vi.fn(),
  listReceiptLinesWithAllocationForExpenses: vi.fn(),
  listReceiptPaymentsForExpenses: vi.fn(),
}))

vi.mock("@workspace/db/receipts", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  getExpenseDetailUseCase,
  getPayableDetailUseCase,
  listFinancialExpenseRowsUseCase,
} from "./financial-expenses"

const ctx = { organizationId: "org-1" }

describe("financial expense read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.listExpensesForOrganization.mockResolvedValue([])
    repo.listPayablesForOrganization.mockResolvedValue([])
    repo.listPayablePaymentsForPayables.mockResolvedValue([])
    repo.listReceiptLinesWithAllocationForExpenses.mockResolvedValue([])
    repo.listReceiptPaymentsForExpenses.mockResolvedValue([])
  })

  it("splits receipt payments proportionally across lines", async () => {
    const expense = {
      id: "receipt-1",
      organizationId: "org-1",
      projectId: "project-1",
      supplierId: "supplier-1",
      expenseDate: new Date("2026-01-02"),
      createdAt: new Date("2026-01-01"),
      paymentStatus: "partial",
    }
    repo.listExpensesForOrganization.mockResolvedValue([
      { expense, projectName: "Project", supplierName: "Supplier" },
    ])
    repo.listReceiptLinesWithAllocationForExpenses.mockResolvedValue([
      {
        line: {
          id: "line-1",
          expenseId: "receipt-1",
          allocationId: "allocation-1",
          itemDescription: "Cement",
          amountCents: 300,
        },
        allocationName: "Foundation",
      },
      {
        line: {
          id: "line-2",
          expenseId: "receipt-1",
          allocationId: "allocation-2",
          itemDescription: "Steel",
          amountCents: 700,
        },
        allocationName: "Frame",
      },
    ])
    repo.listReceiptPaymentsForExpenses.mockResolvedValue([
      { expenseId: "receipt-1", payableId: null, amountCents: 500 },
    ])

    await expect(listFinancialExpenseRowsUseCase(ctx)).resolves.toEqual([
      expect.objectContaining({
        id: "line-1",
        receiptId: "receipt-1",
        paidCents: 150,
      }),
      expect.objectContaining({
        id: "line-2",
        receiptId: "receipt-1",
        paidCents: 350,
      }),
    ])
    expect(repo.listReceiptLinesWithAllocationForExpenses).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      ["receipt-1"]
    )
    expect(repo.listReceiptPaymentsForExpenses).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      ["receipt-1"]
    )
    expect(repo.findExpenseForOrganization).not.toHaveBeenCalled()
  })

  it("includes legacy payables that are not mirrored by current receipts", async () => {
    const createdAt = new Date("2026-01-01")
    repo.listPayablesForOrganization.mockResolvedValue([
      {
        payable: {
          id: "payable-1",
          organizationId: "org-1",
          projectId: "project-1",
          supplierId: null,
          dueDate: null,
          createdAt,
          description: "",
          title: "Legacy payable",
          amountCents: 1200,
          status: "unpaid",
        },
        projectName: "Project",
        supplierName: null,
      },
    ])
    repo.listPayablePaymentsForPayables.mockResolvedValue([
      { payableId: "payable-1", amountCents: 200 },
    ])

    await expect(listFinancialExpenseRowsUseCase(ctx)).resolves.toEqual([
      expect.objectContaining({
        id: "payable-1",
        receiptId: "payable-1",
        source: "payable",
        paidCents: 200,
      }),
    ])
    expect(repo.listPayablePaymentsForPayables).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      ["payable-1"]
    )
    expect(repo.findPayableForOrganization).not.toHaveBeenCalled()
  })

  it("delegates expense and payable detail lookups through workspace scope", async () => {
    repo.findExpenseForOrganization.mockResolvedValue({ expense: { id: "r1" } })
    repo.findPayableForOrganization.mockResolvedValue({ payable: { id: "p1" } })

    await expect(getExpenseDetailUseCase(ctx, "r1")).resolves.toEqual({
      expense: { id: "r1" },
    })
    await expect(getPayableDetailUseCase(ctx, "p1")).resolves.toEqual({
      payable: { id: "p1" },
    })

    expect(repo.findExpenseForOrganization).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      "r1"
    )
    expect(repo.findPayableForOrganization).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      "p1"
    )
  })
})
