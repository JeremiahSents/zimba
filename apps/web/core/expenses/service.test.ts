import { describe, it, expect, vi, beforeEach } from "vitest"
vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth", () => ({}))
vi.mock("@/lib/organization", () => ({}))
import { createPayableExpense, createExpenseReceipt, updateExpenseStatus } from "./service"
import * as expenseRepo from "./repository"
import * as authService from "../auth/service"

vi.mock("./repository")
vi.mock("../auth/service")

describe("Expenses Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.requireSession).mockResolvedValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "session-1", userId: "user-1", expiresAt: new Date(), ipAddress: null, userAgent: null, token: "token-1", createdAt: new Date(), updatedAt: new Date() },
      organization: { organizationId: "org-1", organizationName: "Test Org", role: "Owner / Admin" },
    })
  })

  it("should create a payable expense", async () => {
    vi.mocked(expenseRepo.createExpense).mockResolvedValue({
      id: "exp-1",
    } as any)
    
    vi.mocked(expenseRepo.createExpenseLine).mockResolvedValue({
      id: "line-1",
    } as any)

    const result = await createPayableExpense({
      project_id: 101,
      supplier_id: 202,
      currency: "USD",
      expense_date: "2024-01-01",
      due_date: "2024-01-15",
      lines: [
        {
          allocation_id: 303,
          description: "Cement",
          quantity: 10,
          unit_amount: 15.5,
        }
      ],
      amount_paid: 0,
      lifecycle_status: "incurred",
      submit_for_approval: true,
      record_as_receipt: false,
    })

    expect(result.id).toBe("exp-1")
    expect(result.total_amount).toBe(155) // 10 * 15.5 = 155

    expect(expenseRepo.createExpense).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: "org-1",
      projectId: "101",
      supplierId: "202",
      paymentStatus: "unpaid",
    }))

    expect(expenseRepo.createExpenseLine).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: "org-1",
      expenseId: "exp-1",
      allocationId: "303",
      itemDescription: "Cement",
      quantity: 10,
      unitRateCents: 1550,
      amountCents: 15500,
    }))
  })

  it("should update expense status", async () => {
    vi.mocked(expenseRepo.updateExpense).mockResolvedValue({
      id: "exp-2",
      paymentStatus: "paid",
    } as any)

    await updateExpenseStatus("exp-2", "Full")

    expect(expenseRepo.updateExpense).toHaveBeenCalledWith("exp-2", {
      paymentStatus: "paid",
    })
  })
})
