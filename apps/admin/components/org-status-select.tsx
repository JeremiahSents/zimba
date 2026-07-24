"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { updateOrganizationStatusAction } from "@/core/organizations/actions"

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
    <Select
      value={currentStatus}
      disabled={isPending}
      onValueChange={(val) => {
        if (!val) return
        startTransition(async () => {
          await updateOrganizationStatusAction(organizationId, val)
        })
      }}
    >
      <SelectTrigger size="sm" className="h-8 w-32 capitalize">
        <SelectValue placeholder={currentStatus} />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status} className="capitalize">
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
