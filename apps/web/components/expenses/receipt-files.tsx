import { Card, CardContent } from "@workspace/ui/components/card"
import type { PayableExpenseResponse } from "@/lib/types"

type ReceiptFile = NonNullable<PayableExpenseResponse["attachments"]>[number]

export function ReceiptFiles({ files }: { files: ReceiptFile[] }) {
  if (!files.length) return null

  return (
    <Card className="print:hidden">
      <CardContent>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Receipt files
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {files.map((file) =>
            file.content_type.startsWith("image/") ? (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-2xl border bg-muted/20"
              >
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-40 w-full object-cover"
                />
                <p className="truncate px-3 py-2 font-medium text-xs">
                  {file.filename}
                </p>
              </a>
            ) : (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center rounded-2xl border p-4 font-medium text-primary text-sm hover:underline"
              >
                Open {file.filename}
              </a>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
