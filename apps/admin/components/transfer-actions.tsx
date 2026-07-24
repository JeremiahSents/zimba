"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useState } from "react"
import { approveTransfer, rejectTransfer } from "@/core/transfers/actions"

export function TransferActions({ transferId }: { transferId: string }) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  async function handleApprove() {
    setIsApproving(true)
    const formData = new FormData()
    formData.set("transferId", transferId)
    await approveTransfer(formData)
    setIsApproving(false)
  }

  async function handleReject() {
    setIsRejecting(true)
    const formData = new FormData()
    formData.set("transferId", transferId)
    formData.set("rejectionReason", rejectionReason)
    await rejectTransfer(formData)
    setIsRejecting(false)
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? "Approving…" : "Approve"}
      </Button>

      <Dialog>
        <DialogTrigger
          render={
            <Button
              variant="destructive"
              size="sm"
              disabled={isApproving || isRejecting}
            >
              Reject
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject transfer request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this ownership transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="transfer-rejection-reason">Reason</Label>
            <Input
              id="transfer-rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. The target user has left the organization."
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting…" : "Reject transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
