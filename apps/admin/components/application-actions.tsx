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
import {
  approveApplication,
  rejectApplication,
} from "@/core/applications/actions"

export function ApplicationActions({
  applicationId,
}: {
  applicationId: string
}) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  async function handleApprove() {
    setIsApproving(true)
    const formData = new FormData()
    formData.set("applicationId", applicationId)
    await approveApplication(formData)
    setIsApproving(false)
  }

  async function handleReject() {
    setIsRejecting(true)
    const formData = new FormData()
    formData.set("applicationId", applicationId)
    formData.set("rejectionReason", rejectionReason)
    await rejectApplication(formData)
    setIsRejecting(false)
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        variant="default"
      >
        {isApproving ? "Approving…" : "Approve & Create Workspace"}
      </Button>

      <Dialog>
        <DialogTrigger
          render={
            <Button variant="destructive" disabled={isApproving || isRejecting}>
              Reject
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this application. The applicant
              will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Input
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide more details about your use case."
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting…" : "Reject application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
