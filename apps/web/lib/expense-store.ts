import type { ExpenseResponse, ExpenseStatus } from "@/lib/types"

const STORAGE_KEY = "zimba-project-expenses"
const STATUS_STORAGE_KEY = "zimba-project-expense-statuses"

type StoredProjectExpenses = Record<string, ExpenseResponse[]>
type StoredExpenseStatuses = Record<string, Record<string, ExpenseStatus>>

function readStore(): StoredProjectExpenses {
  if (typeof window === "undefined") return {}
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as StoredProjectExpenses) : {}
  } catch {
    return {}
  }
}

export function readStoredExpenses(projectId: number): ExpenseResponse[] {
  return readStore()[String(projectId)] ?? []
}

export function storeExpense(projectId: number, expense: ExpenseResponse) {
  const store = readStore()
  const projectExpenses = store[String(projectId)] ?? []
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...store,
      [String(projectId)]: [expense, ...projectExpenses],
    })
  )
}

function readStatusStore(): StoredExpenseStatuses {
  if (typeof window === "undefined") return {}
  try {
    const value = window.localStorage.getItem(STATUS_STORAGE_KEY)
    return value ? (JSON.parse(value) as StoredExpenseStatuses) : {}
  } catch {
    return {}
  }
}

export function storeExpenseStatus(
  projectId: number,
  expenseId: number,
  status: ExpenseStatus
) {
  const store = readStatusStore()
  window.localStorage.setItem(
    STATUS_STORAGE_KEY,
    JSON.stringify({
      ...store,
      [String(projectId)]: {
        ...store[String(projectId)],
        [String(expenseId)]: status,
      },
    })
  )
}

export function mergeStoredExpenses(
  projectId: number,
  expenses: ExpenseResponse[]
) {
  const stored = readStoredExpenses(projectId)
  const statuses = readStatusStore()[String(projectId)] ?? {}
  return [
    ...stored,
    ...expenses.filter(
      (expense) =>
        !stored.some((storedExpense) => storedExpense.id === expense.id)
    ),
  ].map((expense) => ({
    ...expense,
    status: statuses[String(expense.id)] ?? expense.status ?? "Full",
  }))
}
