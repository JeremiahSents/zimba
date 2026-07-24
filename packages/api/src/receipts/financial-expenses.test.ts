import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  listExpensesForOrganization: vi.fn(),
  listPayablesForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  getExpenseDetailUseCase,
  getPayableDetailUseCase,
  listFinancialExpenseRowsUseCase,
} from "./financial-expenses"

const deps = { executor: {} as DatabaseExecutor }
const ctx = { organizationId: "org-1" }

describe("financial expense read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.listExpensesForOrganization.mockResolvedValue([])
    repo.listPayablesForOrganization.mockResolvedValue([])
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
    repo.findExpenseForOrganization.mockResolvedValue({
      lines: [
        {
          line: {
            id: "line-1",
            allocationId: "allocation-1",
            itemDescription: "Cement",
            amountCents: 300,
          },
          allocationName: "Foundation",
        },
        {
          line: {
            id: "line-2",
            allocationId: "allocation-2",
            itemDescription: "Steel",
            amountCents: 700,
          },
          allocationName: "Frame",
        },
      ],
      payments: [{ amountCents: 500 }],
    })

    await expect(listFinancialExpenseRowsUseCase(ctx, deps)).resolves.toEqual([
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
    repo.findPayableForOrganization.mockResolvedValue({
      payments: [{ amountCents: 200 }],
    })

    await expect(listFinancialExpenseRowsUseCase(ctx, deps)).resolves.toEqual([
      expect.objectContaining({
        id: "payable-1",
        receiptId: "payable-1",
        source: "payable",
        paidCents: 200,
      }),
    ])
  })

  it("delegates expense and payable detail lookups through workspace scope", async () => {
    repo.findExpenseForOrganization.mockResolvedValue({ expense: { id: "r1" } })
    repo.findPayableForOrganization.mockResolvedValue({ payable: { id: "p1" } })

    await expect(getExpenseDetailUseCase(ctx, deps, "r1")).resolves.toEqual({
      expense: { id: "r1" },
    })
    await expect(getPayableDetailUseCase(ctx, deps, "p1")).resolves.toEqual({
      payable: { id: "p1" },
    })

    expect(repo.findExpenseForOrganization).toHaveBeenCalledWith(
      deps.executor,
      "org-1",
      "r1"
    )
    expect(repo.findPayableForOrganization).toHaveBeenCalledWith(
      deps.executor,
      "org-1",
      "p1"
    )
  })
})
