import { mockExpenses, mockSuppliers } from "@/lib/api/mock-data"
import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

export type SupplierPaymentStatus = "Full" | "Partial" | "Not paid"

export type SupplierListItem = SupplierResponse & {
  paid: number
  remaining: number
  statusSummary: Record<SupplierPaymentStatus, number>
}

export type SupplierLedgerEntry = {
  id: string
  date: string
  project: string
  item: string
  receiptValue: number
  paid: number
  remaining: number
  status: SupplierPaymentStatus
}

export type SupplierProfile = {
  companyContact: string
  contactName: string
  phone: string
  email: string
}

const supplierPaid: Record<string, number> = {
  "Prime Cement": 48_000_000,
  "Mirembe Steel": 14_200_000,
  "Cash / labour": 9_800_000,
}

const supplierProfiles: Record<string, SupplierProfile> = {
  "Prime Cement": {
    companyContact: "+256 414 555 210",
    contactName: "Grace Namusoke",
    phone: "+256 772 118 442",
    email: "grace@primecement.ug",
  },
  "Mirembe Steel": {
    companyContact: "+256 312 555 884",
    contactName: "Isaac Mirembe",
    phone: "+256 701 442 090",
    email: "isaac@mirembesteel.ug",
  },
  "Cash / labour": {
    companyContact: "Site labour pool",
    contactName: "Peter Okello",
    phone: "+256 758 220 611",
    email: "peter.okello@zimba.ug",
  },
}

const extraLedgerEntries: Record<string, SupplierLedgerEntry[]> = {
  "Prime Cement": [
    {
      id: "pc-1",
      date: "2026-06-29",
      project: "Entebbe Villas",
      item: "Cement delivery",
      receiptValue: 22_000_000,
      paid: 22_000_000,
      remaining: 0,
      status: "Full",
    },
    {
      id: "pc-2",
      date: "2026-06-17",
      project: "Nakasero Heights",
      item: "Concrete mix",
      receiptValue: 23_600_000,
      paid: 8_000_000,
      remaining: 15_600_000,
      status: "Partial",
    },
  ],
  "Mirembe Steel": [
    {
      id: "ms-1",
      date: "2026-06-24",
      project: "Nakasero Heights",
      item: "Structural steel",
      receiptValue: 19_400_000,
      paid: 0,
      remaining: 19_400_000,
      status: "Not paid",
    },
    {
      id: "ms-2",
      date: "2026-06-11",
      project: "Kira Retail Block",
      item: "Steel fixings",
      receiptValue: 17_400_000,
      paid: 0,
      remaining: 17_400_000,
      status: "Not paid",
    },
  ],
  "Cash / labour": [
    {
      id: "cl-1",
      date: "2026-06-20",
      project: "Entebbe Villas",
      item: "Finishing crew",
      receiptValue: 14_700_000,
      paid: 0,
      remaining: 14_700_000,
      status: "Not paid",
    },
    {
      id: "cl-2",
      date: "2026-06-09",
      project: "Nakasero Heights",
      item: "Foundation crew",
      receiptValue: 14_500_000,
      paid: 0,
      remaining: 14_500_000,
      status: "Not paid",
    },
  ],
}

export function getSupplierSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getSupplierBySlug(
  slug: string,
  suppliers: SupplierResponse[] = mockSuppliers
) {
  return suppliers.find((supplier) => getSupplierSlug(supplier.name) === slug)
}

export function getSupplierListItems(
  suppliers: SupplierResponse[] = mockSuppliers,
  expenses: ExpenseTableRow[] = mockExpenses
): SupplierListItem[] {
  return suppliers.map((supplier) => {
    const paid =
      supplier.outstanding_amount === undefined
        ? (supplierPaid[supplier.name] ?? 0)
        : supplier.amount
    const remaining =
      supplier.outstanding_amount ?? Math.max(supplier.amount - paid, 0)
    const receiptValue = paid + remaining
    const statusSummary = expenses
      .filter((expense) => expense.supplier_name === supplier.name)
      .reduce<Record<SupplierPaymentStatus, number>>(
        (summary, expense) => {
          summary[expense.status] += 1
          return summary
        },
        { Full: 0, Partial: 0, "Not paid": 0 }
      )
    return {
      ...supplier,
      amount: receiptValue,
      paid,
      remaining,
      statusSummary,
    }
  })
}

export function getSupplierLedger(
  supplier: SupplierResponse,
  expenses: ExpenseTableRow[] = mockExpenses
): SupplierLedgerEntry[] {
  const realEntries = expenses
    .filter((expense) => expense.supplier_name === supplier.name)
    .map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      project: expense.project_name,
      item: expense.item_description,
      receiptValue: expense.amount,
      paid:
        expense.status === "Full"
          ? expense.amount
          : expense.status === "Partial"
            ? Math.round(expense.amount * 0.5)
            : 0,
      remaining:
        expense.status === "Full"
          ? 0
          : expense.status === "Partial"
            ? Math.round(expense.amount * 0.5)
            : expense.amount,
      status: expense.status,
    }))
  return [...realEntries, ...(extraLedgerEntries[supplier.name] ?? [])]
}

export function getSupplierProfile(
  name: string,
  supplier?: SupplierResponse
): SupplierProfile {
  if (
    supplier?.companyContact ||
    supplier?.contactName ||
    supplier?.phone ||
    supplier?.email
  ) {
    return {
      companyContact: supplier.companyContact ?? supplier.phone ?? "Pending",
      contactName: supplier.contactName ?? "Contact pending",
      email: supplier.email ?? "—",
      phone: supplier.phone ?? "—",
    }
  }
  return (
    supplierProfiles[name] ?? {
      companyContact: "Supplier contact pending",
      contactName: "Contact pending",
      phone: "—",
      email: "—",
    }
  )
}
