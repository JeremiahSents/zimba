import { listOwnershipTransferRequestsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import type { Metadata } from "next"
import {
  AdminTable,
  type AdminTableColumn,
  type AdminTableRow,
} from "@/components/admin-table"
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

  const columns: AdminTableColumn[] = [
    { key: "org", label: "Organization" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "status", label: "Status" },
    { key: "reason", label: "Reason" },
    { key: "created", label: "Requested" },
    { key: "actions", label: "", className: "text-right" },
  ]

  const rows: AdminTableRow[] = (transfers as TransferRow[]).map((r) => ({
    id: r.id,
    searchText: `${r.organizationName} ${r.fromUserName} ${r.fromUserEmail} ${r.toUserName} ${r.toUserEmail}`,
    status: r.status,
    cells: {
      org: <span className="font-medium">{r.organizationName}</span>,
      from: (
        <div className="flex flex-col">
          <span className="font-medium">{r.fromUserName}</span>
          <span className="text-muted-foreground text-xs">{r.fromUserEmail}</span>
        </div>
      ),
      to: (
        <div className="flex flex-col">
          <span className="font-medium">{r.toUserName}</span>
          <span className="text-muted-foreground text-xs">{r.toUserEmail}</span>
        </div>
      ),
      status: <StatusBadge status={r.status} />,
      reason: r.reason ? (
        <span className="text-muted-foreground text-sm">{r.reason}</span>
      ) : (
        "—"
      ),
      created: new Date(r.createdAt).toLocaleDateString(),
      actions:
        r.status === "pending" ? (
          <TransferActions transferId={r.id} />
        ) : (
          <span className="text-muted-foreground text-xs">Reviewed</span>
        ),
    },
  }))

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Ownership Transfers"
        description="Review and approve ownership transfer requests between team members."
      />
      <AdminTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search transfers…"
        statusFilter={{
          options: ["pending", "approved", "rejected"],
        }}
        emptyMessage="No transfer requests."
      />
    </div>
  )
}
