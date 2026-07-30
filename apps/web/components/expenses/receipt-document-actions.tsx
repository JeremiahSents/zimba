"use client"

import { Download01Icon, Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DocumentEmailDialog } from "@/components/expenses/document-email-dialog"
import { generateReceiptDocumentAction } from "@/core/documents/actions"

/**
 * The receipt PDF controls, kept out of the detail page so that page does not
 * keep growing. Two states: the document exists, or generation failed and the
 * user gets a way to try again.
 */
export function ReceiptDocumentActions({
  receiptId,
  projectId,
  documentUrl,
  documentNumber,
  supplierName,
  supplierEmail,
  userEmail,
}: {
  receiptId: string
  projectId: string
  documentUrl?: string | null
  documentNumber: string
  supplierName: string
  supplierEmail?: string | null
  userEmail: string
}) {
  const router = useRouter()
  const [emailOpen, setEmailOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function generate() {
    setGenerating(true)
    const result = await generateReceiptDocumentAction(receiptId, projectId)
    setGenerating(false)
    if (!result.success) {
      toast.error(result.error.message)
      return
    }
    toast.success("Receipt PDF ready")
    router.refresh()
  }

  if (!documentUrl) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={generate}
        disabled={generating}
      >
        {generating ? "Generating…" : "Generate PDF"}
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <a href={documentUrl} target="_blank" rel="noreferrer">
          <HugeiconsIcon icon={Download01Icon} size={16} />
          Receipt PDF
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Email receipt"
        onClick={() => setEmailOpen(true)}
      >
        <HugeiconsIcon icon={Mail01Icon} size={16} />
      </Button>
      <DocumentEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        kind="receipt"
        targetId={receiptId}
        receiptId={receiptId}
        projectId={projectId}
        documentNumber={documentNumber}
        supplierName={supplierName}
        supplierEmail={supplierEmail}
        userEmail={userEmail}
      />
    </>
  )
}
