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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import { requestOwnershipTransfer } from "@/core/organizations/transfer-actions"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

export function OwnershipTransferDialog({
  members,
}: {
  members: TeamMember[]
}) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [reason, setReason] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const eligibleMembers = members.filter((m) => m.role !== "owner")

  async function handleSubmit() {
    setError(null)
    setSuccess(false)
    if (!selectedUserId) {
      setError("Select a team member to transfer ownership to.")
      return
    }
    setIsPending(true)
    const formData = new FormData()
    formData.set("toUserId", selectedUserId)
    formData.set("reason", reason)
    const result = await requestOwnershipTransfer(formData)
    setIsPending(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="font-medium text-sm">Transfer request submitted</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Your request has been sent to the Zimba admin team for review. You
          will be notified once it is approved or rejected.
        </p>
      </div>
    )
  }

  if (eligibleMembers.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="font-medium text-sm">No eligible team members</p>
        <p className="mt-1 text-muted-foreground text-sm">
          You need at least one non-owner team member to transfer ownership.
        </p>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Transfer Ownership
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer workspace ownership</DialogTitle>
          <DialogDescription>
            Select a team member to transfer ownership to. This request must be
            approved by the Zimba admin team before it takes effect.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-target">New owner</Label>
            <Select
              value={selectedUserId}
              onValueChange={(v) => setSelectedUserId(v ?? "")}
            >
              <SelectTrigger id="transfer-target" className="w-full">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-reason">Reason (optional)</Label>
            <Input
              id="transfer-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you transferring ownership?"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting…" : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
