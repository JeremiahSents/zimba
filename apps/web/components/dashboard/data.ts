export const dashboardStats = [
  {
    label: "Active projects",
    value: "3",
    detail: "Across Kampala and Entebbe",
  },
  {
    label: "Total budget",
    value: "UGX 1.42B",
    detail: "Approved project allocations",
  },
  {
    label: "Total spent",
    value: "UGX 624M",
    detail: "44% of current budgets",
  },
  {
    label: "Remaining",
    value: "UGX 796M",
    detail: "Available before overruns",
  },
]

export const projects = [
  {
    name: "Nakasero Heights",
    location: "Kampala",
    plotSize: "0.8 acres",
    budget: "UGX 620M",
    spent: "UGX 286M",
    remaining: "UGX 334M",
    progress: 46,
    status: "On track",
  },
  {
    name: "Entebbe Villas",
    location: "Entebbe",
    plotSize: "12 units",
    budget: "UGX 480M",
    spent: "UGX 218M",
    remaining: "UGX 262M",
    progress: 45,
    status: "Review",
  },
  {
    name: "Kira Retail Block",
    location: "Kira",
    plotSize: "2 floors",
    budget: "UGX 320M",
    spent: "UGX 120M",
    remaining: "UGX 200M",
    progress: 38,
    status: "On track",
  },
]

export const expenses = [
  {
    date: "Jul 8",
    project: "Nakasero Heights",
    task: "Concrete",
    supplier: "Prime Cement",
    item: "Cement and aggregates",
    amount: "UGX 18.4M",
  },
  {
    date: "Jul 7",
    project: "Entebbe Villas",
    task: "Labour",
    supplier: "Cash / labour",
    item: "Masonry team payout",
    amount: "UGX 9.8M",
  },
  {
    date: "Jul 6",
    project: "Kira Retail Block",
    task: "Steel",
    supplier: "Mirembe Steel",
    item: "Rebar delivery",
    amount: "UGX 14.2M",
  },
  {
    date: "Jul 5",
    project: "Nakasero Heights",
    task: "Equipment",
    supplier: "LiftPro Rentals",
    item: "Crane rental",
    amount: "UGX 7.6M",
  },
]

export const suppliers = [
  { name: "Prime Cement", amount: "UGX 64M", payments: "8 payments" },
  { name: "Mirembe Steel", amount: "UGX 51M", payments: "5 payments" },
  { name: "Cash / labour", amount: "UGX 39M", payments: "12 payments" },
]

export const roles = ["Owner / Admin", "Site manager", "Accountant"]
