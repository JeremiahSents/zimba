"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { updateAllocationAction, updateProjectAction } from "@/app/admin/projects/actions"
import type { ProjectDetailResponse } from "@/lib/types"

export function ProjectEditForm({ project }: { project: ProjectDetailResponse }) {
  const router = useRouter()
  const [error, setError] = useState("")
  return <DashboardShell title="Edit project" subtitle={project.name} focusedTask>
    <form className="mx-auto grid max-w-3xl gap-5" action={async (formData) => {
      setError("")
      const result = await updateProjectAction(project.id, { name: String(formData.get("name")), location: String(formData.get("location")), client_name: String(formData.get("clientName")), building_type: String(formData.get("buildingType")), land_size: String(formData.get("landSize")), status: String(formData.get("status")) })
      if (!result.success) return setError(result.error.message)
      for (const task of project.tasks) {
        const budget = Number(formData.get(`budget-${task.id}`))
        const taskResult = await updateAllocationAction(project.id, task.id, { budget })
        if (!taskResult.success) return setError(taskResult.error.message)
      }
      router.push(`/admin/projects/${project.id}`); router.refresh()
    }}>
      <Card><CardHeader><CardTitle>Project details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Project name" value={project.name} /><Field name="location" label="Location" value={project.location} /><Field name="clientName" label="Client" value={project.client_name ?? ""} /><Field name="buildingType" label="Building type" value={project.building_type ?? ""} /><Field name="landSize" label="Land / plot size" value={project.land_size ?? project.plot_size ?? ""} />
        <div><Label htmlFor="status">Status</Label><select id="status" name="status" defaultValue={project.status} className="mt-1 h-10 w-full rounded-lg border bg-background px-3"><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option></select></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Allocation budgets</CardTitle></CardHeader><CardContent className="grid gap-4">{project.tasks.map((task) => <div key={task.id}><Label htmlFor={`budget-${task.id}`}>{task.name} (spent {task.spent.toLocaleString("en-UG")})</Label><Input id={`budget-${task.id}`} name={`budget-${task.id}`} type="number" min={task.spent} defaultValue={task.budget} required /></div>)}</CardContent></Card>
      {error && <p className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button><Button type="submit">Save changes</Button></div>
    </form>
  </DashboardShell>
}

function Field({ name, label, value }: { name: string; label: string; value: string }) { return <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} defaultValue={value} required={name === "name" || name === "location"} /></div> }
