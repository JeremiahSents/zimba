import type {
  DatabaseTransaction,
  TransactionRunner,
} from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createLedgerPayment: vi.fn(),
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  syncExpensePaymentStatus: vi.fn(),
  updatePayableForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { recordReceiptPaymentUseCase } from "./record-receipt-payment"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}

const transactionMock = vi.fn(
  async <Result>(
    callback: (tx: DatabaseTransaction) => Promise<Result>
  ): Promise<Result> => callback({} as DatabaseTransaction)
)
const deps = { transaction: transactionMock as TransactionRunner }

const validInput = {
  supplierId: "supplier-1",
  receiptId: "receipt-1",
  amountCents: 5_000,
  currency: "UGX",
  paymentDate: "2026-07-24",
  method: "cash",
}

describe("recordReceiptPaymentUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation(
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
  })

  it("records an expense payment and syncs receipt status in the transaction", async () => {
    const result = await recordReceiptPaymentUseCase(context, deps, validInput)

    expect(result).toEqual({ id: "payment-1" })
    expect(repo.createLedgerPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        supplierId: "supplier-1",
        expenseId: "receipt-1",
        amountCents: 5_000,
      })
    )
    expect(repo.syncExpensePaymentStatus).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "receipt-1"
    )
  })

  it("records a payable payment and marks it paid when fully settled", async () => {
    repo.findExpenseForOrganization.mockResolvedValue(null)
    repo.findPayableForOrganization.mockResolvedValue({
      payable: {
        supplierId: "supplier-1",
        amountCents: 5_000,
      },
      payments: [],
    })

    await recordReceiptPaymentUseCase(context, deps, validInput)

    expect(repo.createLedgerPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ payableId: "receipt-1", amountCents: 5_000 })
    )
    expect(repo.updatePayableForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "receipt-1",
      { status: "paid" }
    )
    expect(repo.syncExpensePaymentStatus).not.toHaveBeenCalled()
  })

  it("rejects overpayment using server-side outstanding balance", async () => {
    await expect(
      recordReceiptPaymentUseCase(context, deps, {
        ...validInput,
        amountCents: 20_000,
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createLedgerPayment).not.toHaveBeenCalled()
  })

  it("rejects supplier mismatch", async () => {
    await expect(
      recordReceiptPaymentUseCase(context, deps, {
        ...validInput,
        supplierId: "other-supplier",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createLedgerPayment).not.toHaveBeenCalled()
  })

  it("returns not found without leaking another workspace", async () => {
    repo.findExpenseForOrganization.mockResolvedValue(null)
    repo.findPayableForOrganization.mockResolvedValue(null)
    await expect(
      recordReceiptPaymentUseCase(context, deps, validInput)
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects unsupported roles before opening the transaction", async () => {
    await expect(
      recordReceiptPaymentUseCase(
        { ...context, role: "viewer" },
        deps,
        validInput
      )
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(transactionMock).not.toHaveBeenCalled()
  })
})
