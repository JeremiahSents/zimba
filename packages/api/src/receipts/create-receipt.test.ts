import type { TransactionRunner } from "@workspace/db/repositories"
import { describe, expect, it, vi } from "vitest"
import type { WorkspaceContext } from "../shared/workspace-context"
import { createReceipt } from "./create-receipt"

function makeCtx(): WorkspaceContext {
  return {
    userId: "user-1",
    organizationId: "org-1",
    role: "accountant",
  }
}

function mockExecutor(overrides: Record<string, unknown> = {}) {
  const base = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "p1", name: "Project 1" }]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "expense-1", paymentStatus: "unpaid" }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "expense-1" }]),
        }),
      }),
    }),
  }
  return { ...base, ...overrides } as unknown
}

function transactionWith(executor: unknown) {
  const transactionStarted = vi.fn()
  const runInTransaction: TransactionRunner = (callback) => {
    transactionStarted()
    return callback(executor as never)
  }
  return {
    runInTransaction,
    transactionStarted,
  }
}

describe("createReceipt use case", () => {
  it("creates a receipt with valid input", async () => {
    const executor = mockExecutor() as never
    const transaction = transactionWith(executor)
    const result = await createReceipt(makeCtx(), transaction, {
      projectId: "p1",
      supplierId: "s1",
      currency: "UGX",
      lines: [
        {
          allocationId: "a1",
          itemDescription: "Cement",
          quantity: 2,
          unitRateCents: 5000,
          amountCents: 10000,
        },
      ],
    })
    expect(result.id).toBeDefined()
    expect(result.paymentStatus).toBe("unpaid")
    expect(result.totalCents).toBe(10000)
    expect(transaction.transactionStarted).toHaveBeenCalledOnce()
  })

  it("rejects invalid input with zod parse error", async () => {
    const executor = mockExecutor() as never
    await expect(
      createReceipt(makeCtx(), transactionWith(executor), { projectId: "" })
    ).rejects.toThrow()
  })

  it("rejects overpayment", async () => {
    const executor = mockExecutor() as never
    await expect(
      createReceipt(makeCtx(), transactionWith(executor), {
        projectId: "p1",
        supplierId: "s1",
        currency: "UGX",
        lines: [
          {
            allocationId: "a1",
            itemDescription: "Cement",
            quantity: 1,
            unitRateCents: 1000,
            amountCents: 1000,
          },
        ],
        payment: { amountCents: 2000, currency: "UGX" },
      })
    ).rejects.toThrow()
  })
})
