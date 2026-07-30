"use client"

import { Download01Icon, Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DocumentEmailDialog } from "@/components/expenses/document-email-dialog"
import { generatePaymentVoucherAction } from "@/core/documents/actions"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { PayableExpenseResponse } from "@/lib/types"

type Payment = PayableExpenseResponse["payments"][number]

/**
 * Payment history, with each payment's voucher alongside it. There is no
 * payment detail route in this app — payments are only ever listed here — so
 * this is where the voucher controls belong.
 */
export function ReceiptPaymentHistory({
  payments,
  receiptId,
  projectId,
  documentNumber,
  supplierName,
  supplierEmail,
  userEmail,
}: {
  payments: Payment[]
  receiptId: string
  projectId: string
  documentNumber: string
  supplierName: string
  supplierEmail?: string | null
  userEmail: string
}) {
  const router = useRouter()
  const [emailingId, setEmailingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  async function generate(paymentId: string) {
    setGeneratingId(paymentId)
    const result = await generatePaymentVoucherAction(
      paymentId,
      receiptId,
      projectId
    )
    setGeneratingId(null)
    if (!result.success) {
      toast.error(result.error.message)
      return
    }
    toast.success("Payment voucher ready")
    router.refresh()
  }

  return (
    <Card>
      <CardContent>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Payment history
        </p>
        {payments.length ? (
          <ol className="mt-4 space-y-4">
            {payments.map((payment, idx) => (
              <li key={payment.id} className="relative flex gap-3">
                {idx !== payments.length - 1 && (
                  <span className="absolute top-5 bottom-[-16px] left-[5px] w-px bg-border" />
                )}
                <span className="relative mt-1.5 flex size-2.5 shrink-0 items-center justify-center rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {formatShortDate(payment.payment_date)}
                      </p>
                      <p className="mt-0.5 text-muted-foreground text-xs capitalize">
                        {payment.method.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {payment.document_url ? (
                      <>
                        <Button variant="outline" size="icon-sm" asChild>
                          <a
                            href={payment.document_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Download voucher"
                          >
                            <HugeiconsIcon icon={Download01Icon} size={14} />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Email voucher"
                          onClick={() => setEmailingId(payment.id)}
                        >
                          <HugeiconsIcon icon={Mail01Icon} size={14} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={generatingId === payment.id}
                        onClick={() => generate(payment.id)}
                      >
                        {generatingId === payment.id
                          ? "Generating…"
                          : "Generate voucher"}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            No payments recorded yet.
          </p>
        )}
      </CardContent>

      {emailingId ? (
        <DocumentEmailDialog
          open
          onOpenChange={(next) => !next && setEmailingId(null)}
          kind="payment_voucher"
          targetId={emailingId}
          receiptId={receiptId}
          projectId={projectId}
          documentNumber={documentNumber}
          supplierName={supplierName}
          supplierEmail={supplierEmail}
          userEmail={userEmail}
        />
      ) : null}
    </Card>
  )
}
