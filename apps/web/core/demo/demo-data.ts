export type DemoProject = {
  id: string
  name: string
  code: string
  status: "active" | "completed" | "on_hold"
  budget: number
  spent: number
  startDate: string
  endDate: string
}

export type DemoExpense = {
  id: string
  projectId: string
  projectName: string
  supplier: string
  amount: number
  status: "pending" | "approved" | "paid"
  date: string
}

export type DemoPayment = {
  id: string
  expenseId: string
  amount: number
  method: "bank_transfer" | "mobile_money" | "cheque"
  status: "pending" | "completed"
  date: string
}

export type DemoSupplier = {
  id: string
  name: string
  category: string
  totalSpent: number
  expenseCount: number
}

export const demoProjects: DemoProject[] = [
  {
    id: "demo-p1",
    name: "Kampala Office Tower",
    code: "KOT-001",
    status: "active",
    budget: 450000000,
    spent: 312000000,
    startDate: "2025-01-15",
    endDate: "2026-03-30",
  },
  {
    id: "demo-p2",
    name: "Entebbe Road Expansion",
    code: "ERE-002",
    status: "active",
    budget: 1200000000,
    spent: 890000000,
    startDate: "2024-08-01",
    endDate: "2026-12-15",
  },
  {
    id: "demo-p3",
    name: "Jinja Housing Estate",
    code: "JHE-003",
    status: "on_hold",
    budget: 680000000,
    spent: 145000000,
    startDate: "2025-03-01",
    endDate: "2027-01-30",
  },
  {
    id: "demo-p4",
    name: "Mbarara Market Renovation",
    code: "MMR-004",
    status: "completed",
    budget: 220000000,
    spent: 218000000,
    startDate: "2024-02-01",
    endDate: "2025-06-30",
  },
]

export const demoExpenses: DemoExpense[] = [
  {
    id: "demo-e1",
    projectId: "demo-p1",
    projectName: "Kampala Office Tower",
    supplier: "Cement Distributors Ltd",
    amount: 45000000,
    status: "paid",
    date: "2025-06-15",
  },
  {
    id: "demo-e2",
    projectId: "demo-p1",
    projectName: "Kampala Office Tower",
    supplier: "Steel Works Uganda",
    amount: 89000000,
    status: "approved",
    date: "2025-06-20",
  },
  {
    id: "demo-e3",
    projectId: "demo-p2",
    projectName: "Entebbe Road Expansion",
    supplier: "Asphalt Supplies Co",
    amount: 156000000,
    status: "pending",
    date: "2025-06-22",
  },
  {
    id: "demo-e4",
    projectId: "demo-p2",
    projectName: "Entebbe Road Expansion",
    supplier: "Heavy Equipment Rental",
    amount: 78000000,
    status: "paid",
    date: "2025-06-10",
  },
  {
    id: "demo-e5",
    projectId: "demo-p3",
    projectName: "Jinja Housing Estate",
    supplier: "Building Materials Ltd",
    amount: 34000000,
    status: "approved",
    date: "2025-06-18",
  },
]

export const demoPayments: DemoPayment[] = [
  {
    id: "demo-pay1",
    expenseId: "demo-e1",
    amount: 45000000,
    method: "bank_transfer",
    status: "completed",
    date: "2025-06-16",
  },
  {
    id: "demo-pay2",
    expenseId: "demo-e4",
    amount: 78000000,
    method: "mobile_money",
    status: "completed",
    date: "2025-06-11",
  },
  {
    id: "demo-pay3",
    expenseId: "demo-e2",
    amount: 89000000,
    method: "bank_transfer",
    status: "pending",
    date: "2025-06-21",
  },
]

export const demoSuppliers: DemoSupplier[] = [
  {
    id: "demo-s1",
    name: "Cement Distributors Ltd",
    category: "Construction Materials",
    totalSpent: 120000000,
    expenseCount: 8,
  },
  {
    id: "demo-s2",
    name: "Steel Works Uganda",
    category: "Steel & Metal",
    totalSpent: 245000000,
    expenseCount: 12,
  },
  {
    id: "demo-s3",
    name: "Asphalt Supplies Co",
    category: "Road Materials",
    totalSpent: 310000000,
    expenseCount: 5,
  },
  {
    id: "demo-s4",
    name: "Heavy Equipment Rental",
    category: "Equipment",
    totalSpent: 156000000,
    expenseCount: 7,
  },
  {
    id: "demo-s5",
    name: "Building Materials Ltd",
    category: "General Materials",
    totalSpent: 89000000,
    expenseCount: 15,
  },
]

export const demoStats = {
  totalProjects: demoProjects.length,
  activeProjects: demoProjects.filter((p) => p.status === "active").length,
  totalExpenses: demoExpenses.length,
  totalBudget: demoProjects.reduce((sum, p) => sum + p.budget, 0),
  totalSpent: demoProjects.reduce((sum, p) => sum + p.spent, 0),
  pendingApprovals: demoExpenses.filter((e) => e.status === "pending").length,
  totalSuppliers: demoSuppliers.length,
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
