import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@workspace/api", () => ({
  createUpcomingPaymentUseCase: vi.fn(),
  updateUpcomingPaymentUseCase: vi.fn(),
  deleteUpcomingPaymentUseCase: vi.fn(),
  recordReceiptPaymentUseCase: vi.fn(),
}))

import * as api from "@workspace/api"
import * as authService from "../auth/service"
import {
  createLedgerPayment,
  createUpcomingPayment,
  updateUpcomingPayment,
} from "./service"

vi.mock("../auth/service")

describe("Payments Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.createUpcomingPaymentUseCase).mockResolvedValue({
      id: "pay-1",
    } as never)
    vi.mocked(api.updateUpcomingPaymentUseCase).mockResolvedValue({
      id: "pay-2",
      status: "paid",
    } as never)
    vi.mocked(api.recordReceiptPaymentUseCase).mockResolvedValue({
      id: "ledger-1",
    } as never)
    vi.mocked(authService.requireSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-1",
        userId: "user-1",
        expiresAt: new Date(),
        ipAddress: null,
        userAgent: null,
        token: "token-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      organization: {
        organizationId: "org-1",
        organizationName: "Test Org",
        slug: "test-org",
        role: "Owner / Admin",
      },
    })
  })

  it("should create upcoming payment", async () => {
    const result = await createUpcomingPayment("proj-1", {
      title: "Material payment",
      amount: 100,
      currency: "UGX",
      due_date: "2024-01-15",
    })

    expect(result?.id).toBe("pay-1")
    expect(
      vi.mocked(api.createUpcomingPaymentUseCase).mock.calls[0]?.[2]
    ).toEqual(
      expect.objectContaining({
        projectId: "proj-1",
        title: "Material payment",
        amount: 100,
      })
    )
  })

  it("should update upcoming payment", async () => {
    await updateUpcomingPayment("pay-2", {
      status: "paid",
    })

    expect(vi.mocked(api.updateUpcomingPaymentUseCase).mock.calls[0]?.[2]).toBe(
      "pay-2"
    )
    expect(
      vi.mocked(api.updateUpcomingPaymentUseCase).mock.calls[0]?.[3]
    ).toEqual(expect.objectContaining({ status: "paid" }))
  })

  it("should create ledger payment", async () => {
    await createLedgerPayment({
      supplier_id: "sup-1",
      amount: 50,
      currency: "USD",
      payment_date: "2024-01-20",
      method: "cash",
      allocations: [{ expense_id: "exp-1", amount: 50 }],
    })

    expect(api.recordReceiptPaymentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1" }),
      expect.anything(),
      expect.objectContaining({
        supplierId: "sup-1",
        receiptId: "exp-1",
        amountCents: 5000,
        currency: "USD",
      })
    )
  })

  it("links a payable payment to payableId so its table status can be derived", async () => {
    await createLedgerPayment({
      supplier_id: "sup-1",
      amount: 500,
      currency: "UGX",
      payment_date: "2026-07-19",
      method: "bank_transfer",
      allocations: [{ expense_id: "payable-1", amount: 500 }],
    })

    expect(api.recordReceiptPaymentUseCase).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        receiptId: "payable-1",
        amountCents: 50_000,
      })
    )
  })
})
