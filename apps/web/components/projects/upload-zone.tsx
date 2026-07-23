"use client"

import { Label } from "@workspace/ui/components/label"
import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type UploadZoneProps = {
  files: File[]
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
}

export function UploadZone({ files, onFiles, onRemove }: UploadZoneProps) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Label>Images and documents</Label>
      <input
        id="project-attachments"
        hidden
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
      />
      <label
        htmlFor="project-attachments"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onFiles(Array.from(event.dataTransfer.files))
        }}
        className={`flex min-h-40 w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring ${files.length ? "bg-muted/15" : ""}`}
      >
        {files.length === 0 ? (
          <>
            <HugeiconsIcon
              icon={Upload04Icon}
              strokeWidth={1.8}
              className="mb-2 size-6 text-primary"
            />
            <p className="font-semibold text-sm">Drag and drop files here</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Images, PDF, Word, and spreadsheet files
            </p>
          </>
        ) : (
          <div className="grid w-full gap-2 sm:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="group relative flex min-h-16 items-center gap-3 overflow-hidden rounded-md border bg-background px-3 py-2 text-left text-xs"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="size-11 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
                    DOC
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {file.name}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground text-[10px]">
                    {file.type.startsWith("image/") ? "Image" : "Document"} ·{" "}
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded px-1.5 py-0.5 text-destructive text-[10px] opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(index)
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex min-h-28 flex-col items-center justify-center rounded-md border border-dashed bg-muted/35 text-muted-foreground">
              <HugeiconsIcon
                icon={Upload04Icon}
                strokeWidth={1.8}
                className="mb-1 size-5 text-primary"
              />
              <span className="font-medium text-xs">Add more files</span>
            </div>
          </div>
        )}
      </label>
    </div>
  )
}
