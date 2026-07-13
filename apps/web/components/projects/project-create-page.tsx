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
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  type Allocation,
  AllocationTable,
  allocationTotal,
  initialAllocations,
} from "@/components/projects/allocation-table"
import {
  type ProjectDetails,
  ProjectDetailsCard,
} from "@/components/projects/project-details-card"
import { ProjectPreviewCard } from "@/components/projects/project-preview-card"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { storeProject } from "@/lib/project-store"

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
  const [rows, setRows] = useState<Allocation[]>(initialAllocations)
  const [error, setError] = useState("")

  const totalBudget = useMemo(() => allocationTotal(rows), [rows])

  const updateDetail = (field: keyof ProjectDetails, value: string) =>
    setDetails((current) => ({ ...current, [field]: value }))

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const { name, location, landSize, buildingType } = details
    if (!name.trim() || !location.trim() || !landSize.trim() || !buildingType) {
      setError(
        "Complete the required project details before creating the project."
      )
      return
    }
    storeProject({
      id: Date.now(),
      name,
      location,
      plot_size: landSize,
      budget: totalBudget,
      spent: 0,
      remaining: totalBudget,
      pct: 0,
    })
    router.push("/dashboard/projects")
  }

  return (
    <DashboardShell title="New project" subtitle="">
      <form onSubmit={submit} className="grid gap-6">
        <PageHeader />
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
                totalBudget={totalBudget}
              />
            </div>
          </div>
          <section className="grid gap-5">
            <AllocationTable rows={rows} onRowsChange={setRows} />
          </section>
        </div>
      </form>
    </DashboardShell>
  )
}

function PageHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/projects">
                Projects
              </BreadcrumbLink>
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
          Set up the project details and initial budget allocation.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/projects" />}
        >
          Cancel
        </Button>
        <Button type="submit">Create project</Button>
      </div>
    </div>
  )
}
