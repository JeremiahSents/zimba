import { describe, it, expect, vi, beforeEach } from "vitest"
vi.mock("server-only", () => ({}))
import {
  createUpcomingPayment,
  updateUpcomingPayment,
  createLedgerPayment,
} from "./service"
import * as paymentRepo from "./repository"
import * as authService from "../auth/service"
import * as expenseRepo from "../expenses/repository"

vi.mock("./repository")
vi.mock("../auth/service")
vi.mock("../expenses/repository")

describe("Payments Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
        role: "Owner / Admin",
      },
    })
  })

  it("should create upcoming payment", async () => {
    vi.mocked(paymentRepo.createPayable).mockResolvedValue({
      id: "pay-1",
    } as any)

    const result = await createUpcomingPayment("proj-1", {
      title: "Material payment",
      amount: 100,
      currency: "UGX",
      due_date: "2024-01-15",
    })

    expect(result?.id).toBe("pay-1")
    expect(paymentRepo.createPayable).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        projectId: "proj-1",
        title: "Material payment",
        amountCents: 10000,
      })
    )
  })

  it("should update upcoming payment", async () => {
    vi.mocked(paymentRepo.updatePayable).mockResolvedValue({
      id: "pay-2",
      status: "paid",
    } as any)

    await updateUpcomingPayment("pay-2", {
      status: "paid",
    })

    expect(paymentRepo.updatePayable).toHaveBeenCalledWith(
      "org-1",
      "pay-2",
      expect.objectContaining({ status: "paid" })
    )
  })

  it("should create ledger payment", async () => {
    vi.mocked(expenseRepo.getExpense).mockResolvedValue({
      expense: { id: "exp-1" },
      lines: [],
      payments: [],
    } as any)
    vi.mocked(paymentRepo.createLedgerPayment).mockResolvedValue({
      id: "ledger-1",
    } as any)

    await createLedgerPayment({
      supplier_id: "sup-1",
      amount: 50,
      currency: "USD",
      payment_date: "2024-01-20",
      method: "cash",
      allocations: [{ expense_id: "exp-1", amount: 50 }],
    })

    expect(paymentRepo.createLedgerPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        supplierId: "sup-1",
        amountCents: 5000,
        currency: "USD",
        expenseId: "exp-1",
        payableId: undefined,
      })
    )
  })

  it("links a payable payment to payableId so its table status can be derived", async () => {
    vi.mocked(expenseRepo.getExpense).mockResolvedValue(null)
    vi.mocked(expenseRepo.getPayable).mockResolvedValue({
      payable: { id: "payable-1" },
      payments: [],
    } as any)
    vi.mocked(paymentRepo.createLedgerPayment).mockResolvedValue({
      id: "ledger-2",
    } as any)

    await createLedgerPayment({
      supplier_id: "sup-1",
      amount: 500,
      currency: "UGX",
      payment_date: "2026-07-19",
      method: "bank_transfer",
      allocations: [{ expense_id: "payable-1", amount: 500 }],
    })

    expect(paymentRepo.createLedgerPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseId: undefined,
        payableId: "payable-1",
      })
    )
    expect(paymentRepo.syncExpensePaymentStatus).not.toHaveBeenCalled()
  })
})
