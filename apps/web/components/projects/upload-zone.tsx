"use client"

import { Label } from "@workspace/ui/components/label"
import { useRef } from "react"

type UploadZoneProps = {
  files: File[]
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
}

export function UploadZone({ files, onFiles, onRemove }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Label>Images and documents</Label>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onFiles(Array.from(event.dataTransfer.files))
        }}
        onClick={() => inputRef.current?.click()}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors hover:bg-muted/40"
      >
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
        />
        <p className="font-semibold text-sm">Drag and drop files here</p>
        <p className="mt-1 text-muted-foreground text-xs">
          Images, PDF, Word, and spreadsheet files
        </p>
      </div>
      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
            >
              <span className="flex min-w-0 items-center gap-3 truncate">
                {file.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="size-8 rounded object-cover"
                  />
                )}
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                className="text-destructive"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove(index)
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
