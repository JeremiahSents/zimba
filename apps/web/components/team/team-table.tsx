"use client"

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
import { DataTable } from "@workspace/ui/components/data-table"
import { type ReactNode, useMemo, useState } from "react"
import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import type { TeamMember } from "@/lib/types"

export function TeamTable({
  members,
  title,
}: {
  members: TeamMember[]
  title?: ReactNode
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
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
    ],
    []
  )

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
  )
}
