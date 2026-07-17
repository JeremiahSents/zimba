import "server-only"
import { getPayableExpense } from "@/core/expenses/service"

export async function getPayableReceipt(expenseId: string) {
  return getPayableExpense(expenseId)
}
