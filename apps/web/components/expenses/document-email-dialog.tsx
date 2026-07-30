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
import { toast } from "@workspace/ui/components/sonner"
import { useState } from "react"
import { sendDocumentEmailAction } from "@/core/documents/actions"

/**
 * Sending a document is the only place in this app where a customer's data
 * leaves for a third party, so the dialog states plainly what is going where
 * and the user confirms the exact address. That makes this the confirmation
 * step — there is deliberately no second "are you sure".
 */
export function DocumentEmailDialog({
  open,
  onOpenChange,
  kind,
  targetId,
  receiptId,
  projectId,
  documentNumber,
  supplierName,
  supplierEmail,
  userEmail,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: "receipt" | "payment_voucher"
  targetId: string
  receiptId: string
  projectId: string
  documentNumber: string
  supplierName: string
  supplierEmail?: string | null
  userEmail: string
}) {
  const [recipient, setRecipient] = useState<"self" | "supplier">("self")
  const [email, setEmail] = useState(supplierEmail ?? "")
  const [sending, setSending] = useState(false)

  const label = kind === "receipt" ? "receipt" : "payment voucher"
  const canSend = recipient === "self" || email.trim().length > 0

  async function send() {
    setSending(true)
    const result = await sendDocumentEmailAction({
      kind,
      targetId,
      receiptId,
      projectId,
      recipient,
      email: recipient === "supplier" ? email.trim() : "",
    })
    setSending(false)
    if (!result.success) {
      // Left open on purpose so a typed address survives a failed send.
      toast.error(result.error.message)
      return
    }
    onOpenChange(false)
    toast.success(`Sent to ${result.data.to}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Email {label === "receipt" ? "receipt" : "voucher"}
          </DialogTitle>
          <DialogDescription>
            {documentNumber} · {supplierName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={recipient === "self" ? "default" : "outline"}
              onClick={() => setRecipient("self")}
            >
              Email myself
            </Button>
            <Button
              type="button"
              variant={recipient === "supplier" ? "default" : "outline"}
              onClick={() => setRecipient("supplier")}
            >
              Email the supplier
            </Button>
          </div>

          {recipient === "self" ? (
            <div className="grid gap-2">
              <Label>Send to</Label>
              <p className="text-muted-foreground text-sm">{userEmail}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="document-email">Send to</Label>
              <Input
                id="document-email"
                type="email"
                value={email}
                // Focused when there is nothing on file, so the one thing left
                // to do is the thing the cursor is already in.
                autoFocus={!supplierEmail}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="supplier@example.com"
              />
              {supplierEmail ? null : (
                <p className="text-muted-foreground text-xs">
                  No email on file for {supplierName}.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button onClick={send} disabled={sending || !canSend}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
