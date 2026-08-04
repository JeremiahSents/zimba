"use client"

import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@workspace/ui/components/data-table"
import { type ReactNode, useMemo, useState, useTransition } from "react"
import { ErrorNotice } from "@/components/shared/error-notice"
import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import type { PublicError } from "@/core/shared/errors"
import { removeMemberAction } from "@/core/team/actions"
import type { TeamMember } from "@/lib/types"

function canRemoveMember(
  member: TeamMember,
  canRemove: boolean,
  currentUserId: string
) {
  return canRemove && Boolean(member.id) && member.userId !== currentUserId
}

function RemoveMemberButton({
  member,
  onError,
}: {
  member: TeamMember
  onError: (error: PublicError | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const memberId = member.id
  if (!memberId) return null
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Remove ${member.name}`}
      disabled={isPending}
      onClick={() => {
        if (
          !window.confirm(
            `Remove ${member.name} from this workspace? They lose access immediately.`
          )
        )
          return
        startTransition(async () => {
          const result = await removeMemberAction(memberId)
          onError(result.success ? null : result.error)
        })
      }}
    >
      <HugeiconsIcon
        icon={Delete02Icon}
        strokeWidth={2}
        className="size-4 text-destructive"
      />
    </Button>
  )
}

export function TeamTable({
  members,
  title,
  canRemove,
  currentUserId,
}: {
  members: TeamMember[]
  title?: ReactNode
  canRemove: boolean
  currentUserId: string
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [error, setError] = useState<PublicError | null>(null)

  const columns = useMemo<ColumnDef<TeamMember>[]>(() => {
    const base: ColumnDef<TeamMember>[] = [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "responsibility", header: "Responsibility" },
      {
        id: "access",
        header: "Access",
        cell: () => <Badge variant="success">Active</Badge>,
        enableSorting: false,
      },
    ]
    if (!canRemove) return base
    return [
      ...base,
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) =>
          canRemoveMember(row.original, canRemove, currentUserId) ? (
            <div className="text-right">
              <RemoveMemberButton member={row.original} onError={setError} />
            </div>
          ) : null,
      },
    ]
  }, [canRemove, currentUserId])

  const table = useReactTable({
    data: members,
    columns,
    state: { globalFilter: filter, sorting },
    onGlobalFilterChange: setFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <>
      {error && <ErrorNotice error={error} />}
      <DataTable
        table={table}
        title={title}
        rowNumbers
        search={{
          value: filter,
          onChange: setFilter,
          placeholder: "Search team...",
          label: "Search team members",
        }}
        emptyMessage="No team members yet. Invite a member to give them access to this workspace."
        footerNote={`${totalRows} ${totalRows === 1 ? "member" : "members"}`}
        renderMobileRow={(row) => {
          const member = row.original
          return (
            <MobileDataCard
              eyebrow={member.role}
              title={member.name}
              status={<Badge variant="success">Active</Badge>}
              actions={
                canRemoveMember(member, canRemove, currentUserId) ? (
                  <RemoveMemberButton member={member} onError={setError} />
                ) : null
              }
            >
              <dl>
                <MobileDataMeta label="Responsibility">
                  {member.responsibility}
                </MobileDataMeta>
              </dl>
            </MobileDataCard>
          )
        }}
      />
    </>
  )
}
