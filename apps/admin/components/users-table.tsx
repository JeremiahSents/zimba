"use client"

import { EyeIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import Link from "next/link"
import { useState } from "react"

export type UserItem = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  platformRole?: string | null
  primaryOrganization?: string | null
  organizationName?: string | null
  createdAt: Date | string
  deactivatedAt?: Date | string | null
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

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatCreatedDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

interface UsersTableProps {
  data: UserItem[]
}

export function UsersTable({ data }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          type="button"
          className="cursor-pointer font-semibold text-foreground text-xs tracking-tight transition-colors hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border">
            {row.original.image ? (
              <AvatarImage src={row.original.image} alt={row.original.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 font-medium text-primary text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          {row.original.deactivatedAt ? (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-medium text-red-700 text-xs dark:text-red-400">
              Deactivated
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <button
          type="button"
          className="cursor-pointer font-semibold text-foreground text-xs tracking-tight transition-colors hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground text-sm">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "platformRole",
      header: ({ column }) => (
        <button
          type="button"
          className="cursor-pointer font-semibold text-foreground text-xs tracking-tight transition-colors hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
        </button>
      ),
      cell: ({ row }) => {
        const role = row.original.platformRole
        if (role === "super_admin") {
          return (
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/15 font-medium text-emerald-700 text-xs capitalize dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              Super Admin
            </Badge>
          )
        }
        if (role === "support") {
          return (
            <Badge
              variant="outline"
              className="border-amber-500/20 bg-amber-500/15 font-medium text-amber-700 text-xs capitalize dark:bg-amber-500/10 dark:text-amber-400"
            >
              Support
            </Badge>
          )
        }
        return (
          <Badge variant="secondary" className="font-medium text-xs capitalize">
            User
          </Badge>
        )
      },
    },
    {
      accessorKey: "organizationName",
      header: ({ column }) => (
        <button
          type="button"
          className="cursor-pointer font-semibold text-foreground text-xs tracking-tight transition-colors hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
        </button>
      ),
      cell: ({ row }) => {
        const org =
          row.original.organizationName || row.original.primaryOrganization
        return (
          <span className="font-medium text-muted-foreground text-xs sm:text-sm">
            {org || "Unassigned"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="cursor-pointer font-semibold text-foreground text-xs tracking-tight transition-colors hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-xs sm:text-sm">
          {formatCreatedDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right font-semibold text-xs">Action</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1.5 rounded-lg px-2.5"
          >
            <Link href={`/users/${row.original.id}`}>
              <HugeiconsIcon icon={EyeIcon} className="size-3.5 text-primary" />
              <span>View</span>
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const roleFilterValue =
    (table.getColumn("platformRole")?.getFilterValue() as string) ?? "all"

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-48 max-w-sm flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search users by name or email…"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 rounded-xl pl-9"
            />
          </div>
          <Select
            value={roleFilterValue}
            onValueChange={(value) => {
              table
                .getColumn("platformRole")
                ?.setFilterValue(value === "all" ? undefined : value)
            }}
          >
            <SelectTrigger size="sm" className="h-9 w-40 rounded-xl">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="font-medium text-muted-foreground text-xs">
          Showing {table.getFilteredRowModel().rows.length} of {data.length}{" "}
          users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-2.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 rounded-lg text-xs"
          >
            Previous
          </Button>
          <span className="px-2 font-medium text-muted-foreground text-xs">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 rounded-lg text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
