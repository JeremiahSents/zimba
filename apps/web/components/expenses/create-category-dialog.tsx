"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ErrorNotice } from "@/components/shared/error-notice"
import type { PublicError } from "@/core/shared/errors"

type Props = {
  open: boolean
  name: string
  budget: string
  error: PublicError | string
  pending: boolean
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onBudgetChange: (value: string) => void
  onSubmit: () => void
}

export function CreateCategoryDialog({
  open,
  name,
  budget,
  error,
  pending,
  onOpenChange,
  onNameChange,
  onBudgetChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>
            Add a project category with its own budget. This increases the
            overall project budget.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <label className="grid gap-2">
            <Label htmlFor="new-receipt-category">Category name</Label>
            <Input
              id="new-receipt-category"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="e.g. Transport"
              autoFocus
            />
          </label>
          <label className="grid gap-2">
            <Label htmlFor="new-receipt-category-budget">Budget</Label>
            <Input
              id="new-receipt-category-budget"
              inputMode="numeric"
              value={budget ? Number(budget).toLocaleString("en-US") : ""}
              onChange={(event) =>
                onBudgetChange(event.target.value.replace(/\D/g, ""))
              }
              placeholder="0"
            />
          </label>
          {error && <ErrorNotice error={error} />}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || !name.trim() || !budget.trim()}
            onClick={onSubmit}
          >
            {pending ? "Creating..." : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
