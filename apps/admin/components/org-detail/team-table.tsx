"use client"

import {
  Delete02Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { toast } from "@workspace/ui/components/sonner"
import { type ReactNode, useMemo, useState, useTransition } from "react"
import { deactivateUserAccountAction } from "@/core/users/actions"

type Member = {
  id: string
  userId: string
  role: string
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
  const [pendingDeactivate, setPendingDeactivate] = useState<Member | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeactivate() {
    const target = pendingDeactivate
    if (!target) return
    startTransition(async () => {
      const result = await deactivateUserAccountAction(target.userId)
      if (result.success) {
        toast.success(`${target.user.name}'s account has been deactivated.`)
      } else {
        toast.error(result.error?.message ?? "Failed to deactivate account.")
      }
      setPendingDeactivate(null)
    })
  }

  function handleMessage(member: Member) {
    toast.info(`Messaging is not available yet.`, {
      description: `Message to ${member.user.name} would go here.`,
    })
  }

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
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Message ${row.original.user.name}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMessage(row.original)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Message01Icon} strokeWidth={1.8} className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Deactivate ${row.original.user.name}'s account`}
              onClick={(e) => {
                e.stopPropagation()
                setPendingDeactivate(row.original)
              }}
              className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} className="size-4" />
            </Button>
          </div>
        ),
        meta: { align: "right", cellClassName: "whitespace-nowrap" },
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
    <>
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

      <Dialog open={pendingDeactivate !== null} onOpenChange={(open) => !open && setPendingDeactivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate account?</DialogTitle>
            <DialogDescription>
              {pendingDeactivate ? (
                <>
                  This will deactivate{" "}
                  <span className="font-medium text-foreground">
                    {pendingDeactivate.user.name}
                  </span>
                  's account. They will lose access to the platform, but their
                  data is preserved and the action can be reversed.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isPending}>Cancel</Button>}
            />
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isPending}
            >
              {isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
