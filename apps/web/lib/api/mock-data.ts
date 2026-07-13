import type {
  CompanySettings,
  ExpenseTableRow,
  ProjectDashboardResponse,
  ProjectDetailResponse,
  SpendChartPoint,
  SupplierResponse,
  TeamMember,
  UtilizationChartPoint,
} from "@/lib/types"

export const mockProjectListDetails = {
  1: {
    client: "Zimba Developments",
    timeline: "Jan – Nov 2026",
    status: "On track" as const,
  },
  2: {
    client: "Lakeview Living",
    timeline: "Mar – Dec 2026",
    status: "On track" as const,
  },
  3: {
    client: "Kira Commercial",
    timeline: "May 2026 – Feb 2027",
    status: "At risk" as const,
  },
}

export const mockProjects: ProjectDashboardResponse[] = [
  {
    id: 1,
    name: "Nakasero Heights",
    location: "Kampala",
    plot_size: "0.8 acres",
    budget: 620_000_000,
    spent: 286_000_000,
    remaining: 334_000_000,
    pct: 46,
  },
  {
    id: 2,
    name: "Entebbe Villas",
    location: "Entebbe",
    plot_size: "12 units",
    budget: 480_000_000,
    spent: 218_000_000,
    remaining: 262_000_000,
    pct: 45,
  },
  {
    id: 3,
    name: "Kira Retail Block",
    location: "Kira",
    plot_size: "2 floors",
    budget: 320_000_000,
    spent: 120_000_000,
    remaining: 200_000_000,
    pct: 38,
  },
]

export const mockExpenses: ExpenseTableRow[] = [
  {
    id: 1,
    date: "2026-07-08",
    project_name: "Nakasero Heights",
    task_name: "Concrete",
    supplier_name: "Prime Cement",
    item_description: "Cement and aggregates",
    amount: 18_400_000,
  },
  {
    id: 2,
    date: "2026-07-07",
    project_name: "Entebbe Villas",
    task_name: "Labour",
    supplier_name: "Cash / labour",
    item_description: "Masonry team payout",
    amount: 9_800_000,
  },
  {
    id: 3,
    date: "2026-07-06",
    project_name: "Kira Retail Block",
    task_name: "Steel",
    supplier_name: "Mirembe Steel",
    item_description: "Rebar delivery",
    amount: 14_200_000,
  },
  {
    id: 4,
    date: "2026-07-05",
    project_name: "Nakasero Heights",
    task_name: "Equipment",
    supplier_name: "LiftPro Rentals",
    item_description: "Crane rental",
    amount: 7_600_000,
  },
]

export const mockSuppliers: SupplierResponse[] = [
  {
    name: "Prime Cement",
    amount: 64_000_000,
    payments: 8,
    category: "materials",
  },
  {
    name: "Mirembe Steel",
    amount: 51_000_000,
    payments: 5,
    category: "materials",
  },
  {
    name: "Cash / labour",
    amount: 39_000_000,
    payments: 12,
    category: "labour",
  },
]

export const mockProjectDetails: ProjectDetailResponse[] = mockProjects.map(
  (project) => ({
    ...project,
    expenses: mockExpenses
      .filter((expense) => expense.project_name === project.name)
      .map(toExpenseResponse),
    suppliers: mockSuppliers
      .filter((supplier) =>
        mockExpenses.some(
          (expense) =>
            expense.project_name === project.name &&
            expense.supplier_name === supplier.name
        )
      )
      .map(({ name, amount }) => ({ name, amount })),
    tasks: [
      {
        id: project.id * 10 + 1,
        name: "Materials",
        budget: Math.round(project.budget * 0.45),
        spent: Math.round(project.spent * 0.5),
        pct: Math.min(project.pct + 4, 100),
      },
      {
        id: project.id * 10 + 2,
        name: "Labour",
        budget: Math.round(project.budget * 0.3),
        spent: Math.round(project.spent * 0.25),
        pct: Math.max(project.pct - 8, 0),
      },
    ],
  })
)

function toExpenseResponse(expense: ExpenseTableRow) {
  return {
    amount: expense.amount,
    date: expense.date,
    id: expense.id,
    item_description: expense.item_description,
    supplier_name: expense.supplier_name,
    task_name: expense.task_name,
  }
}

export const mockSpendChart: SpendChartPoint[] = [
  { month: "Jan", spent: 120_000_000, budget: 200_000_000 },
  { month: "Feb", spent: 150_000_000, budget: 200_000_000 },
  { month: "Mar", spent: 180_000_000, budget: 200_000_000 },
  { month: "Apr", spent: 90_000_000, budget: 200_000_000 },
  { month: "May", spent: 130_000_000, budget: 200_000_000 },
  { month: "Jun", spent: 170_000_000, budget: 200_000_000 },
  { month: "Jul", spent: 190_000_000, budget: 200_000_000 },
]

export const mockUtilizationChart: UtilizationChartPoint[] = [
  { month: "Jan", utilization: 32 },
  { month: "Feb", utilization: 35 },
  { month: "Mar", utilization: 38 },
  { month: "Apr", utilization: 41 },
  { month: "May", utilization: 42 },
  { month: "Jun", utilization: 43 },
  { month: "Jul", utilization: 44 },
]

export const mockTeamMembers: TeamMember[] = [
  {
    name: "Musa Byaruhanga",
    role: "Owner / Admin",
    responsibility: "Approves budgets",
  },
  {
    name: "Amina Kato",
    role: "Site manager",
    responsibility: "Logs site expenses",
  },
  {
    name: "Daniel Okello",
    role: "Accountant",
    responsibility: "Reviews payments",
  },
]

export const mockCompanySettings: CompanySettings = {
  company: "Zimba Consultants",
  currency: "UGX",
  defaultRegion: "Kampala",
  fiscalPeriod: "Monthly",
}
