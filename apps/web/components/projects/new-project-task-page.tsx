"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createProjectTaskAction } from "@/app/admin/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import type { ProjectDetailResponse } from "@/lib/types"

export function NewProjectTaskPage({
  project,
  returnTo,
}: {
  project: ProjectDetailResponse
  returnTo: string
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  return (
    <DashboardShell title="New project task" subtitle="" focusedTask>
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a project task</CardTitle>
            <CardDescription>
              Add a task to {project.name} with the budget available for this work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault()
                setSaving(true)
                setError("")
                const result = await createProjectTaskAction(project.id, {
                  budget: Number(budget),
                  name,
                })
                if (!result.ok) {
                  setError(result.error)
                  setSaving(false)
                  return
                }
                router.push(`${returnTo}${returnTo.includes("?") ? "&" : "?"}task=${encodeURIComponent(name.trim())}`)
                router.refresh()
              }}
            >
              {error ? <p className="text-destructive text-sm" role="alert">{error}</p> : null}
              <label className="grid gap-2">
                <Label>Task name</Label>
                <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Electrical installation" />
              </label>
              <label className="grid gap-2">
                <Label>Initial budget</Label>
                <Input required min="0.01" step="0.01" type="number" inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="0" />
              </label>
              <div className="flex justify-end gap-3 border-t pt-5">
                <Button type="button" variant="secondary" onClick={() => router.push(returnTo)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create task"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
