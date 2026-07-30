import {
  getAdminBudgetItemReceiptsUseCase,
  getAdminProjectDetailUseCase,
  getOrganizationDetailUseCase,
} from "@workspace/api"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { BreadcrumbSetter } from "@/components/breadcrumb-context"
import { BudgetItemReceiptCards } from "@/components/org-detail/budget-item-receipt-cards"
import { StatCard } from "@/components/stat-card"
import { formatCompactCurrency } from "@/lib/format-currency"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BanknoteIcon,
  Coins01Icon,
  ReceiptTextIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export default async function BudgetItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string; budgetItemId: string }>
}) {
  const { id: organizationId, projectId, budgetItemId } = await params

  const [project, receipts, org] = await Promise.all([
    getAdminProjectDetailUseCase(organizationId, projectId),
    getAdminBudgetItemReceiptsUseCase(organizationId, projectId, budgetItemId),
    getOrganizationDetailUseCase(organizationId),
  ])

  const budgetItem = project.budgetItems.find((item) => item.id === budgetItemId)
  if (!budgetItem) notFound()
  const orgName = org?.name ?? "Organization"

  const totalSpent = receipts.reduce((sum, r) => sum + r.totalCents, 0)
  const totalPaid = receipts.reduce((sum, r) => sum + r.paidCents, 0)
  const remaining = budgetItem.budgetCents - totalSpent
  const utilization =
    budgetItem.budgetCents > 0
      ? Math.min(100, Math.round((totalSpent / budgetItem.budgetCents) * 100))
      : 0

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Organizations", href: "/organizations" },
          { label: orgName, href: `/organizations/${organizationId}` },
          { label: "Projects", href: `/organizations/${organizationId}?tab=projects` },
          {
            label: toTitleCase(project.name),
            href: `/organizations/${organizationId}/projects/${projectId}`,
          },
          { label: toTitleCase(budgetItem.name) },
        ]}
      />
      <AdminDashboardShell
        title={toTitleCase(budgetItem.name)}
        description={`${toTitleCase(project.name)} · Budget item`}
      >
      <div className="mt-4 flex flex-col gap-4">
        <section>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Budget item receipts
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Allocated Budget"
            value={formatCompactCurrency(
              budgetItem.budgetCents,
              project.currency
            )}
            icon={
              <HugeiconsIcon
                icon={BanknoteIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="Total allocation"
          />
          <StatCard
            title="Receipts Total"
            value={formatCompactCurrency(totalSpent, project.currency)}
            icon={
              <HugeiconsIcon
                icon={ReceiptTextIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${receipts.length} ${receipts.length === 1 ? "receipt" : "receipts"}`}
          />
          <StatCard
            title="Paid"
            value={formatCompactCurrency(totalPaid, project.currency)}
            icon={
              <HugeiconsIcon
                icon={Coins01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="Settled amount"
          />
          <StatCard
            title="Remaining"
            value={formatCompactCurrency(remaining, project.currency)}
            icon={
              <HugeiconsIcon
                icon={Wallet01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${utilization}% utilized`}
          />
        </div>

        <BudgetItemReceiptCards
          receipts={receipts}
          currency={project.currency}
        />
      </div>
    </AdminDashboardShell>
    </>
  )
}
