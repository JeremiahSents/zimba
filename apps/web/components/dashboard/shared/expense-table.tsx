import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { formatCurrency, formatShortDate } from "@/lib/zimba/format"
import type { ExpenseTableRow } from "@/lib/zimba/types"

export function ExpenseTable({ expenses }: { expenses: ExpenseTableRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="text-muted-foreground">
              {formatShortDate(expense.date)}
            </TableCell>
            <TableCell className="font-medium">
              {expense.project_name}
            </TableCell>
            <TableCell>{expense.task_name}</TableCell>
            <TableCell>{expense.supplier_name}</TableCell>
            <TableCell>{expense.item_description}</TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(expense.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
