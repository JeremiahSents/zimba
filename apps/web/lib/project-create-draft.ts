import type { ProjectDetails } from "@/components/projects/project-details-card"

const STORAGE_KEY = "zimba-project-create-draft"

export type InitialAllocation = {
  id: number
  name: string
  amount: string
}

export type ProjectCreateDraft = {
  details: ProjectDetails
  allocations: InitialAllocation[]
}

export const defaultInitialAllocations: InitialAllocation[] = [
  { id: 1, name: "Land", amount: "" },
  { id: 2, name: "Labour", amount: "" },
  { id: 3, name: "Materials", amount: "" },
]

export function readProjectCreateDraft(): ProjectCreateDraft | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as ProjectCreateDraft) : null
  } catch {
    return null
  }
}

export function writeProjectCreateDraft(draft: ProjectCreateDraft) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearProjectCreateDraft() {
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export function initialAllocationTotal(rows: InitialAllocation[]) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
}
