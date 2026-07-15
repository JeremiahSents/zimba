"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useMemo, useState } from "react"
import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ResponsiveDataView } from "@/components/shared/responsive-data-view"
import type { TeamMember } from "@/lib/types"

export function TeamTable({ members }: { members: TeamMember[] }) {
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
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search team..."
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {table.getFilteredRowModel().rows.length} members
        </span>
      </div>
      <ResponsiveDataView
        mobile={
          table.getRowModel().rows.length ? <div className="space-y-3">
            {table.getRowModel().rows.map((row) => {
              const member = row.original
              return (
                <MobileDataCard
                  key={row.id}
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
            })}
          </div> : <EmptyTeamState />
        }
        desktop={
          table.getRowModel().rows.length ? <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="px-0 text-inherit"
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table> : <EmptyTeamState />
        }
      />
      <div className="grid grid-cols-2 gap-2 border-t pt-3 sm:flex sm:justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function EmptyTeamState() {
  return (
    <div className="rounded-xl border border-dashed px-5 py-10 text-center">
      <p className="font-medium text-sm">No team members yet</p>
      <p className="mt-1 text-muted-foreground text-xs">
        Invite a member to give them access to this workspace.
      </p>
    </div>
  )
}
