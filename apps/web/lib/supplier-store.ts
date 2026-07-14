import type { SupplierResponse } from "@/lib/types"

const STORAGE_KEY = "zimba-suppliers"

export type NewSupplierValues = {
  name: string
  category: SupplierResponse["category"]
  companyContact: string
  contactName: string
  phone: string
  email: string
  notes: string
}

export type StoredSupplier = SupplierResponse &
  NewSupplierValues & { id: number }

function readStore(): StoredSupplier[] {
  if (typeof window === "undefined") return []
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as StoredSupplier[]) : []
  } catch {
    return []
  }
}

export function readStoredSuppliers() {
  return readStore()
}

export function storeSupplier(values: NewSupplierValues) {
  const supplier: StoredSupplier = {
    ...values,
    id: Date.now(),
    amount: 0,
    payments: 0,
  }
  const suppliers = [
    supplier,
    ...readStore().filter(
      (item) => item.name.toLowerCase() !== values.name.toLowerCase()
    ),
  ]
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers))
  return supplier
}
