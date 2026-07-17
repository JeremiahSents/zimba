"use client"

import {
  ArrowLeft01Icon,
  File02Icon,
  Image02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { updateProjectAction } from "@/app/admin/projects/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import type { ProjectAttachment, ProjectDetailResponse } from "@/lib/types"
import { uploadZimbaFile } from "@/lib/upload-file"

export function ProjectFilesPage({
  project,
}: {
  project: ProjectDetailResponse
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const files = project.attachments ?? []
  const images = files.filter((file) => file.content_type.startsWith("image/"))
  const documents = files.filter(
    (file) => !file.content_type.startsWith("image/")
  )
  return (
    <DashboardShell
      title="Project files"
      subtitle={`Files and images for ${project.name}.`}
    >
      <div className="mb-6 grid gap-3">
        <Link
          href={`/admin/projects/${project.id}`}
          className="inline-flex items-center gap-2 font-semibold text-primary text-xs hover:underline"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} /> Back to project
        </Link>
        <div>
          <h1 className="font-heading font-semibold text-2xl tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 text-muted-foreground text-xs">
            {project.location}
          </p>
        </div>
        <div className="flex w-full justify-end sm:w-auto">
          <input
            ref={inputRef}
            hidden
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={async (event) => {
              const selected = Array.from(event.target.files ?? [])
              if (!selected.length) return
              setUploading(true)
              setError("")
              try {
                const ids = await Promise.all(
                  selected.map((file) =>
                    uploadZimbaFile(file, "project_attachment")
                  )
                )
                const result = await updateProjectAction(project.id, {
                  attachment_ids: ids,
                })
                if (!result.success) setError(result.error.message)
                else window.location.reload()
              } catch (uploadError) {
                setError(
                  uploadError instanceof Error
                    ? uploadError.message
                    : "The files could not be uploaded."
                )
              }
              setUploading(false)
              event.target.value = ""
            }}
          />
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload files"}
          </Button>
        </div>
      </div>
      {error && (
        <p className="mb-4 text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <HugeiconsIcon
            icon={File02Icon}
            size={28}
            className="mx-auto text-muted-foreground"
          />
          <h2 className="mt-3 font-heading font-semibold text-base">
            No files uploaded yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-muted-foreground text-xs">
            Project images and documents will appear here when they have been
            uploaded.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {images.length > 0 && <FileImageGrid files={images} />}
          {documents.length > 0 && <DocumentList files={documents} />}
        </div>
      )}
    </DashboardShell>
  )
}

function FileImageGrid({ files }: { files: ProjectAttachment[] }) {
  return (
    <section>
      <Heading icon={Image02Icon} title="Images" count={files.length} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {files.map((file, index) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border bg-muted/20"
          >
            <div className="relative aspect-square bg-muted">
              <ProjectImage file={file} />
            </div>
            <p className="truncate px-3 py-2 font-medium text-xs">
              File {index + 1} · {file.filename}
            </p>
            <div className="px-3 pb-2">
              <FilePurpose purpose={file.purpose} />
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
function ProjectImage({ file }: { file: ProjectAttachment }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center text-muted-foreground">
        <HugeiconsIcon icon={Image02Icon} size={24} />
        <span className="text-[10px]">File unavailable. Upload it again.</span>
      </div>
    )
  }
  return (
    <Image
      src={file.url}
      alt={file.filename}
      fill
      unoptimized
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      onError={() => setFailed(true)}
      className="size-full object-cover transition-transform group-hover:scale-[1.03]"
    />
  )
}
function DocumentList({ files }: { files: ProjectAttachment[] }) {
  return (
    <section>
      <Heading icon={File02Icon} title="Documents" count={files.length} />
      <div className="divide-y rounded-xl border">
        {files.map((file, index) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-muted/30"
          >
            <HugeiconsIcon
              icon={File02Icon}
              size={20}
              className="shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate font-medium text-sm">
              File {index + 1} · {file.filename}
            </span>
            <span className="shrink-0 text-muted-foreground text-xs">
              {formatBytes(file.size_bytes)}
            </span>
            <FilePurpose purpose={file.purpose} />
          </a>
        ))}
      </div>
    </section>
  )
}
function FilePurpose({ purpose }: { purpose?: string }) {
  const isReceipt = purpose === "expense_receipt"
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px] ${
        isReceipt
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {isReceipt ? "Receipt" : "Project file"}
    </span>
  )
}
function Heading({
  icon,
  title,
  count,
}: {
  icon: typeof File02Icon
  title: string
  count: number
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <HugeiconsIcon icon={icon} size={17} className="text-primary" />
      <h2 className="font-heading font-semibold text-base">{title}</h2>
      <span className="text-muted-foreground text-xs">{count}</span>
    </div>
  )
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
