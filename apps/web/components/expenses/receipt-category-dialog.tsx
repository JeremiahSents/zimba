import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ErrorNotice } from "@/components/shared/error-notice"
import type { PublicError } from "@/core/shared/errors"

export function ReceiptCategoryDialog({
  open,
  onOpenChange,
  allocations,
  selectedAllocation,
  onSelect,
  payable,
  correcting,
  error,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  allocations: Array<{ id: string; name: string }>
  selectedAllocation: string
  onSelect: (value: string) => void
  payable: boolean
  correcting: boolean
  error: PublicError | string
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set receipt category</DialogTitle>
          <DialogDescription>
            Choose the project category this receipt should use.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={selectedAllocation || undefined}
          onValueChange={(value) => onSelect(value ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {allocations.map((allocation) => (
              <SelectItem key={allocation.id} value={allocation.id}>
                {allocation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <ErrorNotice error={error} />}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedAllocation || correcting || !payable}
            onClick={onSave}
          >
            {correcting ? "Saving..." : "Save category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
