import type { DatabaseTransaction } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  createLedgerPayment: vi.fn(),
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  updatePayableForOrganization: vi.fn(),
  updateReceiptForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { markReceiptFullyPaidUseCase } from "./mark-receipt-paid"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}

describe("markReceiptFullyPaidUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.findExpenseForOrganization.mockResolvedValue({
      expense: { supplierId: "supplier-1" },
      lines: [{ line: { amountCents: 12_000 } }],
      payments: [{ amountCents: 2_000 }],
    })
    repo.findPayableForOrganization.mockResolvedValue(null)
    repo.createLedgerPayment.mockResolvedValue({ id: "payment-1" })
    repo.updateReceiptForOrganization.mockResolvedValue({ id: "receipt-1" })
    repo.updatePayableForOrganization.mockResolvedValue({ id: "payable-1" })
  })

  it("marks an expense receipt fully paid using the server-calculated outstanding amount", async () => {
    const result = await markReceiptFullyPaidUseCase(
      context,
      "receipt-1",
      "key-1"
    )

    expect(result).toEqual({ id: "payment-1" })
    expect(repo.createLedgerPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        expenseId: "receipt-1",
        amountCents: 10_000,
        idempotencyKey: "key-1",
      })
    )
    expect(repo.updateReceiptForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "receipt-1",
      { paymentStatus: "paid" }
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "receipt.mark_fully_paid",
        entityType: "expense",
        changes: { amountCents: 10_000 },
      })
    )
  })

  it("marks a payable receipt fully paid", async () => {
    repo.findExpenseForOrganization.mockResolvedValue(null)
    repo.findPayableForOrganization.mockResolvedValue({
      payable: {
        amountCents: 20_000,
        supplierId: "supplier-1",
        currency: "UGX",
      },
      payments: [{ amountCents: 5_000 }],
    })

    await markReceiptFullyPaidUseCase(context, "payable-1", "key-2")

    expect(repo.createLedgerPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        payableId: "payable-1",
        amountCents: 15_000,
      })
    )
    expect(repo.updatePayableForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "payable-1",
      { status: "paid" }
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ entityType: "payable" })
    )
  })

  it("rejects fully paid receipts without creating another payment", async () => {
    repo.findExpenseForOrganization.mockResolvedValue({
      expense: { supplierId: "supplier-1" },
      lines: [{ line: { amountCents: 10_000 } }],
      payments: [{ amountCents: 10_000 }],
    })

    await expect(
      markReceiptFullyPaidUseCase(context, "receipt-1", "key-1")
    ).rejects.toMatchObject({ code: "CONFLICT" })
    expect(repo.createLedgerPayment).not.toHaveBeenCalled()
  })

  it("returns not found without leaking another workspace", async () => {
    repo.findExpenseForOrganization.mockResolvedValue(null)
    repo.findPayableForOrganization.mockResolvedValue(null)

    await expect(
      markReceiptFullyPaidUseCase(context, "missing", "key-1")
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects unsupported roles before opening the transaction", async () => {
    await expect(
      markReceiptFullyPaidUseCase(
        { ...context, role: "viewer" },
        "receipt-1",
        "key-1"
      )
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(dbMock.transaction).not.toHaveBeenCalled()
  })
})
