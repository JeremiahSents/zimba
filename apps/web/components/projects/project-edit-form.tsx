"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import {
  createProjectTaskAction,
  updateAllocationAction,
  updateProjectAction,
} from "@/core/projects/actions"
import type { PublicError } from "@/core/shared/errors"
import type { ProjectDetailResponse, TaskResponse } from "@/lib/types"

export function ProjectEditForm({
  project,
}: {
  project: ProjectDetailResponse
}) {
  const router = useRouter()
  const slug = useWorkspaceSlug()
  const [error, setError] = useState<PublicError | string>("")
  const [tasks, setTasks] = useState<TaskResponse[]>(project.tasks)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryBudget, setNewCategoryBudget] = useState("")
  const [isAddingCategory, startAddingCategory] = useTransition()

  function addCategory() {
    const name = newCategoryName.trim()
    const budget = Number(newCategoryBudget)

    if (!name || !Number.isFinite(budget) || budget <= 0) {
      setError("Add a category name and a budget greater than zero.")
      return
    }

    setError("")
    startAddingCategory(async () => {
      const result = await createProjectTaskAction(project.id, { name, budget })
      if (!result.success) {
        setError(result.error)
        return
      }

      setTasks((current) => [...current, result.data])
      setNewCategoryName("")
      setNewCategoryBudget("")
      router.refresh()
    })
  }

  return (
    <DashboardShell
      title="Edit project"
      subtitle="Update project details and category budgets."
      focusedTask
    >
      <form
        className="mx-auto grid w-full max-w-6xl gap-6"
        action={async (formData) => {
          setError("")
          const result = await updateProjectAction(project.id, {
            name: String(formData.get("name")),
            location: String(formData.get("location")),
            client_name: String(formData.get("clientName")),
            building_type: String(formData.get("buildingType")),
            land_size: String(formData.get("landSize")),
            status: String(formData.get("status")),
          })
          if (!result.success) return setError(result.error)

          for (const task of tasks) {
            const budget = Number(formData.get(`budget-${task.id}`))
            const taskResult = await updateAllocationAction(
              project.id,
              task.id,
              {
                budget,
              }
            )
            if (!taskResult.success) return setError(taskResult.error)
          }

          router.push(`/${slug}/projects/${project.id}`)
          router.refresh()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <p className="text-muted-foreground text-sm">
              Core information used across project reports and receipts.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field name="name" label="Project name" value={project.name} />
            <Field name="location" label="Location" value={project.location} />
            <Field
              name="clientName"
              label="Client"
              value={project.client_name ?? ""}
            />
            <Field
              name="buildingType"
              label="Building type"
              value={project.building_type ?? ""}
            />
            <Field
              name="landSize"
              label="Land / plot size"
              value={project.land_size ?? project.plot_size ?? ""}
            />
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={project.status}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
              >
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category budgets</CardTitle>
            <p className="text-muted-foreground text-sm">
              Your project total is the sum of these category budgets.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid items-end gap-3 rounded-xl border border-dashed bg-muted/10 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
              <div>
                <Label htmlFor="newCategoryName" className="font-semibold">
                  New category
                </Label>
                <Input
                  className="mt-1"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label htmlFor="newCategoryBudget" className="text-xs">
                  Budget
                </Label>
                <Input
                  className="mt-1"
                  id="newCategoryBudget"
                  value={newCategoryBudget}
                  onChange={(event) => setNewCategoryBudget(event.target.value)}
                  type="number"
                  min={1}
                  placeholder="0"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={addCategory}
                disabled={isAddingCategory}
              >
                {isAddingCategory ? "Adding..." : "Add category"}
              </Button>
            </div>

            {tasks.map((task) => (
              <div
                key={task.id}
                className="grid items-end gap-3 rounded-xl border bg-muted/15 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_10rem]"
              >
                <div>
                  <Label
                    htmlFor={`budget-${task.id}`}
                    className="font-semibold"
                  >
                    {task.name}
                  </Label>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Spent {task.spent.toLocaleString("en-UG")} - Remaining{" "}
                    {Math.max(0, task.budget - task.spent).toLocaleString(
                      "en-UG"
                    )}
                  </p>
                </div>
                <div className="text-muted-foreground text-xs">
                  Current budget
                  <strong className="mt-1 block text-foreground text-sm">
                    {task.budget.toLocaleString("en-UG")}
                  </strong>
                </div>
                <div>
                  <Label htmlFor={`budget-${task.id}`} className="text-xs">
                    New budget
                  </Label>
                  <Input
                    className="mt-1"
                    id={`budget-${task.id}`}
                    name={`budget-${task.id}`}
                    type="number"
                    min={task.spent}
                    defaultValue={task.budget}
                    required
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {error && <ErrorNotice error={error} />}
        <div className="sticky bottom-3 z-10 flex justify-end gap-2 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </DashboardShell>
  )
}

function Field({
  name,
  label,
  value,
}: {
  name: string
  label: string
  value: string
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        required={name === "name" || name === "location"}
      />
    </div>
  )
}
