"use client"

import {
  Delete02Icon,
  PencilEdit02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useCallback, useMemo, useState } from "react"

export type Allocation = {
  id: number
  name: string
  quantity: string
  unitCost: string
}

export const initialAllocations: Allocation[] = [
  { id: 1, name: "Land", quantity: "", unitCost: "" },
  { id: 2, name: "Labour", quantity: "", unitCost: "" },
  { id: 3, name: "Materials", quantity: "", unitCost: "" },
]

export function allocationTotal(rows: Allocation[]) {
  return rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitCost || 0),
    0
  )
}

const columnWidths: Record<string, string> = {
  name: "w-[42%]",
  quantity: "w-[12%]",
  unitCost: "w-[18%]",
  budget: "w-[20%]",
  actions: "w-[8%]",
}

type AllocationTableProps = {
  rows: Allocation[]
  onRowsChange: React.Dispatch<React.SetStateAction<Allocation[]>>
}

export function AllocationTable({ rows, onRowsChange }: AllocationTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)

  const updateRow = useCallback(
    (id: number, field: keyof Allocation, value: string) =>
      onRowsChange((current) =>
        current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      ),
    [onRowsChange]
  )

  const removeRow = useCallback(
    (id: number) =>
      onRowsChange((current) => current.filter((item) => item.id !== id)),
    [onRowsChange]
  )

  const addRow = useCallback(
    () =>
      onRowsChange((current) => [
        ...current,
        { id: Date.now(), name: "", quantity: "", unitCost: "" },
      ]),
    [onRowsChange]
  )

  const columns = useMemo<ColumnDef<Allocation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Expense name",
        cell: ({ row }) => (
          <EditableText
            editing={editingId === row.original.id}
            value={row.original.name}
            onChange={(value) => updateRow(row.original.id, "name", value)}
            onStart={() => setEditingId(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "quantity",
        header: () => <div className="text-right">Quantity</div>,
        cell: ({ row }) => (
          <EditableNumber
            editing={editingId === row.original.id}
            value={row.original.quantity}
            onChange={(val) => updateRow(row.original.id, "quantity", val)}
            onStart={() => setEditingId(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "unitCost",
        header: () => <div className="text-right">Unit cost</div>,
        cell: ({ row }) => (
          <EditableNumber
            editing={editingId === row.original.id}
            value={row.original.unitCost}
            onChange={(val) => updateRow(row.original.id, "unitCost", val)}
            onStart={() => setEditingId(row.original.id)}
          />
        ),
      },
      {
        id: "budget",
        header: () => <div className="text-right">Budget</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium text-muted-foreground">
            {(
              Number(row.original.quantity || 0) *
              Number(row.original.unitCost || 0)
            ).toLocaleString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            editing={editingId === row.original.id}
            name={row.original.name}
            onToggleEdit={() =>
              setEditingId((current) =>
                current === row.original.id ? null : row.original.id
              )
            }
            onRemove={() => removeRow(row.original.id)}
          />
        ),
      },
    ],
    [editingId, removeRow, updateRow]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-heading font-semibold text-base">
          Initial allocation
        </h2>
      </div>
      <Table className="table-fixed overflow-hidden rounded-lg border border-border">
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((group) => (
            <TableRow
              key={group.id}
              className="border-border border-b hover:bg-transparent"
            >
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`border-border border-r last:border-r-0 ${columnWidths[header.column.id] ?? ""}`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-border border-b last:border-b-0"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={`border-border border-r last:border-r-0 ${cell.column.id === "actions" ? "p-0 text-center" : ""}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={addRow}
      >
        + Add item
      </Button>
    </div>
  )
}

function RowActions({
  editing,
  name,
  onToggleEdit,
  onRemove,
}: {
  editing: boolean
  name: string
  onToggleEdit: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={editing ? "Done editing" : `Edit ${name || "item"}`}
        className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onToggleEdit}
      >
        <HugeiconsIcon
          icon={editing ? Tick02Icon : PencilEdit02Icon}
          strokeWidth={2}
          className="size-4"
        />
      </button>
      <button
        type="button"
        aria-label={`Remove ${name || "item"}`}
        className="inline-flex size-5 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive hover:text-white"
        onClick={onRemove}
      >
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
      </button>
    </div>
  )
}

function EditableText({
  value,
  onChange,
  editing,
  onStart,
}: {
  value: string
  onChange: (value: string) => void
  editing: boolean
  onStart: () => void
}) {
  if (!editing) {
    return (
      <button
        type="button"
        className="w-full truncate text-left font-semibold"
        onClick={onStart}
      >
        {value || "Add expense name"}
      </button>
    )
  }
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Add expense name"
      className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
    />
  )
}

function formatWithCommas(raw: string) {
  if (!raw) return ""
  const [intPart, decPart] = raw.split(".")
  const formattedInt = (intPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt
}

function EditableNumber({
  value,
  onChange,
  editing,
  onStart,
}: {
  value: string
  onChange: (value: string) => void
  editing: boolean
  onStart: () => void
}) {
  if (!editing) {
    return (
      <button
        type="button"
        className="w-full text-left text-muted-foreground tabular-nums"
        onClick={onStart}
      >
        {value ? Number(value).toLocaleString() : "0"}
      </button>
    )
  }
  return (
    <input
      inputMode="decimal"
      value={formatWithCommas(value)}
      onChange={(event) => {
        const raw = event.target.value.replace(/[^0-9.]/g, "")
        if (raw.split(".").length > 2) return
        onChange(raw)
      }}
      placeholder="0"
      className="w-full bg-transparent text-left tabular-nums outline-none placeholder:text-muted-foreground"
    />
  )
}
