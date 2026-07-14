import type { ExpenseResponse } from "@/lib/types"

const STORAGE_KEY = "zimba-project-expenses"

type StoredProjectExpenses = Record<string, ExpenseResponse[]>

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

export function mergeStoredExpenses(
  projectId: number,
  expenses: ExpenseResponse[]
) {
  const stored = readStoredExpenses(projectId)
  return [
    ...stored,
    ...expenses.filter(
      (expense) =>
        !stored.some((storedExpense) => storedExpense.id === expense.id)
    ),
  ]
}
