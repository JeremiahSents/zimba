import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  findAllocationForProject: vi.fn(),
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  insertReceipt: vi.fn(),
  insertReceiptLine: vi.fn(),
  updateReceiptLinesAllocation: vi.fn(),
}))
vi.mock("@workspace/db/repositories", () => repo)

import { correctReceiptCategoryUseCase } from "./correct-category"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}
const run = async (callback: (tx: never) => Promise<unknown>) =>
  callback({} as never)

describe("correctReceiptCategoryUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findAllocationForProject.mockResolvedValue([{ id: "allocation-1" }])
  })

  it("updates lines for an existing receipt", async () => {
    repo.findExpenseForOrganization.mockResolvedValue({
      expense: { projectId: "project-1" },
      lines: [],
    })
    const result = await correctReceiptCategoryUseCase(
      context,
      { executor: {} as never, transaction: run as never },
      "receipt-1",
      "allocation-1"
    )
    expect(result).toEqual({
      receiptId: "receipt-1",
      allocationId: "allocation-1",
    })
    expect(repo.updateReceiptLinesAllocation).toHaveBeenCalledWith(
      {},
      "org-1",
      "receipt-1",
      "allocation-1"
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "receipt.category.correct",
        entityId: "receipt-1",
        changes: { allocationId: "allocation-1" },
      })
    )
  })

  it("converts a payable into a categorized receipt", async () => {
    repo.findExpenseForOrganization.mockResolvedValue(null)
    repo.findPayableForOrganization.mockResolvedValue({
      payable: {
        id: "payable-1",
        projectId: "project-1",
        supplierId: "supplier-1",
        status: "unpaid",
        amountCents: 5000,
        title: "Materials",
        description: null,
        createdAt: new Date(),
        dueDate: null,
      },
    })
    await correctReceiptCategoryUseCase(
      context,
      { executor: {} as never, transaction: run as never },
      "payable-1",
      "allocation-1"
    )
    expect(repo.insertReceipt).toHaveBeenCalledOnce()
    expect(repo.insertReceiptLine).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        expenseId: "payable-1",
        allocationId: "allocation-1",
        amountCents: 5000,
      })
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledOnce()
  })
})
