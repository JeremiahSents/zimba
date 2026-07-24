import { listOwnershipTransferRequestsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import type { Metadata } from "next"
import { AdminTable, type AdminTableColumn } from "@/components/admin-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { TransferActions } from "@/components/transfer-actions"
import { requirePlatformSession } from "@/core/auth/service"

export const metadata: Metadata = {
  title: "Ownership Transfers | Zimba Admin",
  description: "Review ownership transfer requests.",
}

export const dynamic = "force-dynamic"

type TransferRow = {
  id: string
  organizationId: string
  organizationName: string
  fromUserName: string
  fromUserEmail: string
  toUserName: string
  toUserEmail: string
  status: string
  reason: string | null
  rejectionReason: string | null
  createdAt: Date
}

export default async function TransfersPage() {
  await requirePlatformSession()
  const transfers = await listOwnershipTransferRequestsUseCase(apiExecutor)

  const columns: AdminTableColumn<TransferRow>[] = [
    {
      key: "org",
      label: "Organization",
      searchableText: (r) => r.organizationName,
      render: (r) => <span className="font-medium">{r.organizationName}</span>,
    },
    {
      key: "from",
      label: "From",
      searchableText: (r) => `${r.fromUserName} ${r.fromUserEmail}`,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.fromUserName}</span>
          <span className="text-muted-foreground text-xs">
            {r.fromUserEmail}
          </span>
        </div>
      ),
    },
    {
      key: "to",
      label: "To",
      searchableText: (r) => `${r.toUserName} ${r.toUserEmail}`,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.toUserName}</span>
          <span className="text-muted-foreground text-xs">{r.toUserEmail}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) =>
        r.reason ? (
          <span className="text-muted-foreground text-sm">{r.reason}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "created",
      label: "Requested",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (r) =>
        r.status === "pending" ? (
          <TransferActions transferId={r.id} />
        ) : (
          <span className="text-muted-foreground text-xs">Reviewed</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Ownership Transfers"
        description="Review and approve ownership transfer requests between team members."
      />
      <AdminTable
        columns={columns}
        rows={transfers as TransferRow[]}
        searchPlaceholder="Search transfers…"
        statusFilter={{
          options: ["pending", "approved", "rejected"],
          getValue: (r) => (r as TransferRow).status,
        }}
        emptyMessage="No transfer requests."
      />
    </div>
  )
}
