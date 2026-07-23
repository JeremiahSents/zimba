import type { PayableExpenseResponse } from "@/lib/types"

type ReceiptFile = NonNullable<PayableExpenseResponse["attachments"]>[number]

export function ReceiptFiles({ files }: { files: ReceiptFile[] }) {
  return (
    <section className="mt-6 rounded-2xl border bg-card p-5 print:hidden">
      <h2 className="font-heading font-semibold">Receipt files</h2>
      {files.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {files.map((file) =>
            file.content_type.startsWith("image/") ? (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-xl border bg-muted/20"
              >
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-48 w-full object-cover"
                />
                <p className="truncate px-3 py-2 font-medium text-sm">
                  {file.filename}
                </p>
              </a>
            ) : (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border p-4 font-medium text-primary hover:underline"
              >
                Open {file.filename}
              </a>
            )
          )}
        </div>
      ) : (
        <p className="mt-2 text-muted-foreground text-sm">
          No receipt images or documents are attached.
        </p>
      )}
    </section>
  )
}
