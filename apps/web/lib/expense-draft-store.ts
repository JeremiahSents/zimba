const STORAGE_PREFIX = "zimba-expense-draft:"

export type ExpenseDraftItem = {
  id: number
  itemDetails: string
  taskName: string
  supplierName: string
  quantity: string
  rate: string
}

export type ExpenseDraft = {
  date: string
  status: "Partial" | "Full" | "Not paid"
  items: ExpenseDraftItem[]
}

function key(projectId: number) {
  return `${STORAGE_PREFIX}${projectId}`
}

export function readExpenseDraft(projectId: number): ExpenseDraft | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(key(projectId))
    return raw ? (JSON.parse(raw) as ExpenseDraft) : null
  } catch {
    return null
  }
}

export function storeExpenseDraft(projectId: number, draft: ExpenseDraft) {
  window.sessionStorage.setItem(key(projectId), JSON.stringify(draft))
}

export function clearExpenseDraft(projectId: number) {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(key(projectId))
}
