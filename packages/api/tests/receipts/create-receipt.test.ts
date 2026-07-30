import { beforeEach, describe, expect, it, vi } from "vitest"
import type { WorkspaceContext } from "../../src/shared/workspace-context"

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { createReceipt } from "../../src/receipts/create-receipt"

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

function runTransactionsWith(executor: unknown) {
  dbMock.transaction.mockImplementation((callback: (tx: never) => unknown) =>
    callback(executor as never)
  )
}

describe("createReceipt use case", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a receipt with valid input", async () => {
    runTransactionsWith(mockExecutor())
    const result = await createReceipt(makeCtx(), {
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
    expect(dbMock.transaction).toHaveBeenCalledOnce()
  })

  it("returns no paymentId when nothing was paid", async () => {
    runTransactionsWith(mockExecutor())
    const result = await createReceipt(makeCtx(), {
      projectId: "p1",
      supplierId: "s1",
      currency: "UGX",
      lines: [
        {
          allocationId: "a1",
          itemDescription: "Cement",
          quantity: 1,
          unitRateCents: 10000,
          amountCents: 10000,
        },
      ],
    })
    expect(result.paymentId).toBeNull()
  })

  // The caller generates a voucher for this payment, so the id it gets back has
  // to be the id actually written — `insertReceiptPayment` returns nothing.
  it("returns the id it wrote for an inline payment", async () => {
    const executor = mockExecutor()
    runTransactionsWith(executor)
    const result = await createReceipt(makeCtx(), {
      projectId: "p1",
      supplierId: "s1",
      currency: "UGX",
      lines: [
        {
          allocationId: "a1",
          itemDescription: "Cement",
          quantity: 1,
          unitRateCents: 10000,
          amountCents: 10000,
        },
      ],
      payment: { amountCents: 4000, currency: "UGX" },
    })

    expect(result.paymentId).toEqual(expect.any(String))
    expect(result.paidCents).toBe(4000)
    expect(result.paymentStatus).toBe("partial")

    const written = (
      executor as { insert: { mock: { results: { value: unknown }[] } } }
    ).insert.mock.results
      .map(
        (call) =>
          (call.value as { values: { mock: { calls: unknown[][] } } }).values
            .mock.calls
      )
      .flat(2) as Array<{ id?: string; amountCents?: number }>
    const paymentRow = written.find((row) => row?.amountCents === 4000)
    expect(paymentRow?.id).toBe(result.paymentId)
  })

  it("rejects invalid input with zod parse error", async () => {
    runTransactionsWith(mockExecutor())
    await expect(createReceipt(makeCtx(), { projectId: "" })).rejects.toThrow()
  })

  it("rejects overpayment", async () => {
    runTransactionsWith(mockExecutor())
    await expect(
      createReceipt(makeCtx(), {
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
