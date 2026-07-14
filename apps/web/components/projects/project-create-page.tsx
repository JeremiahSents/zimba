"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  type ProjectDetails,
  ProjectDetailsCard,
} from "@/components/projects/project-details-card"
import { ProjectPreviewCard } from "@/components/projects/project-preview-card"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import {
  clearProjectCreateDraft,
  defaultInitialAllocations,
  initialAllocationTotal,
  readProjectCreateDraft,
  writeProjectCreateDraft,
} from "@/lib/project-create-draft"
import { uploadZimbaFile } from "@/lib/upload-file"

const emptyDetails: ProjectDetails = {
  name: "",
  location: "",
  landSize: "",
  buildingType: "",
}

export function ProjectCreatePage() {
  const router = useRouter()
  const [details, setDetails] = useState<ProjectDetails>(emptyDetails)
  const [files, setFiles] = useState<File[]>([])
  const [draftBudget, setDraftBudget] = useState(0)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const draft = readProjectCreateDraft()
    if (draft) {
      setDetails(draft.details)
      setDraftBudget(initialAllocationTotal(draft.allocations))
    }
  }, [])

  const updateDetail = (field: keyof ProjectDetails, value: string) => {
    const nextDetails = { ...details, [field]: value }
    setDetails(nextDetails)
    const existingDraft = readProjectCreateDraft()
    writeProjectCreateDraft({
      details: nextDetails,
      allocations: existingDraft?.allocations ?? defaultInitialAllocations,
      attachmentIds: existingDraft?.attachmentIds,
    })
  }

  async function goToAllocation(event: React.FormEvent) {
    event.preventDefault()
    const { name, location, landSize, buildingType } = details
    if (!name.trim() || !location.trim() || !landSize.trim() || !buildingType) {
      setError(
        "Complete the required project details before creating the project."
      )
      return
    }
    setUploading(true)
    setError("")
    let attachmentIds = readProjectCreateDraft()?.attachmentIds ?? []
    try {
      if (files.length > 0) {
        attachmentIds = await Promise.all(
          files.map((file) => uploadZimbaFile(file, "project_attachment"))
        )
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The project files could not be uploaded."
      )
      setUploading(false)
      return
    }
    const existingDraft = readProjectCreateDraft()
    writeProjectCreateDraft({
      details,
      attachmentIds,
      allocations: existingDraft?.allocations.length
        ? existingDraft.allocations
        : defaultInitialAllocations,
    })
    router.push("/admin/projects/new/allocation")
  }

  return (
    <DashboardShell title="New project" subtitle="">
      <form onSubmit={goToAllocation} className="grid gap-6">
        <PageHeader
          pending={uploading}
          onCancel={() => {
            clearProjectCreateDraft()
            router.push("/admin/projects")
          }}
        />
        {error && (
          <p className="font-medium text-destructive text-xs">{error}</p>
        )}
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
            <ProjectDetailsCard
              details={details}
              onDetailChange={updateDetail}
              files={files}
              onFiles={(incoming) =>
                setFiles((current) => [...current, ...incoming])
              }
              onRemoveFile={(index) =>
                setFiles((current) =>
                  current.filter((_, fileIndex) => fileIndex !== index)
                )
              }
            />
            <div className="lg:sticky lg:top-4">
              <ProjectPreviewCard
                name={details.name}
                location={details.location}
                buildingType={details.buildingType}
                landSize={details.landSize}
                files={files}
                totalBudget={draftBudget}
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}

function PageHeader({
  onCancel,
  pending,
}: {
  onCancel: () => void
  pending: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New project</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className="mt-2 font-heading font-semibold text-xl">
          Create a project
        </h2>
        <p className="mt-1 text-muted-foreground text-xs">
          Add the project details before setting its initial allocation.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading..." : "Next"}
        </Button>
      </div>
    </div>
  )
}
