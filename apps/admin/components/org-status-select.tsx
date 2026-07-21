"use client"

import { useTransition } from "react"
import { updateOrganizationStatusAction } from "@/app/organizations/actions"

const STATUS_OPTIONS = ["active", "trial", "suspended"] as const

export function OrganizationStatusSelect({
  organizationId,
  currentStatus,
}: {
  organizationId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        startTransition(async () => {
          await updateOrganizationStatusAction(organizationId, e.target.value)
        })
      }}
      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm capitalize shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status} className="capitalize">
          {status}
        </option>
      ))}
    </select>
  )
}
