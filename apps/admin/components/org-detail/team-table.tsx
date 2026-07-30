"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import { type ReactNode, useMemo, useState } from "react"

type Member = {
  id: string
  role: string
  responsibility: string | null
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatShortDate(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TeamTable({
  members,
  title,
}: {
  members: Member[]
  title?: ReactNode
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        accessorFn: (row) => row.user.name,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {row.original.user.image ? (
                <AvatarImage
                  src={row.original.user.image}
                  alt={row.original.user.name}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
                {getInitials(row.original.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-sm">
                {row.original.user.name}
              </span>
              <span className="text-muted-foreground text-sm">
                {row.original.user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <Badge
              variant="outline"
              className={
                role.toLowerCase() === "owner" ||
                role.toLowerCase() === "admin"
                  ? "border-emerald-500/20 bg-emerald-500/15 font-semibold text-emerald-700 text-xs capitalize dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-blue-500/20 bg-blue-500/15 font-medium text-blue-700 text-xs capitalize dark:bg-blue-500/10 dark:text-blue-400"
              }
            >
              {role}
            </Badge>
          )
        },
      },
      {
        accessorKey: "responsibility",
        header: "Responsibility",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
    ],
    []
  )

  const table = useReactTable({
    data: members,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <DataTable
      table={table}
      title={title}
      rowNumbers
      pagination="always"
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search members...",
        label: "Search members",
      }}
      emptyMessage="No members assigned."
      footerNote={`${totalRows} ${totalRows === 1 ? "member" : "members"}`}
    />
  )
}
