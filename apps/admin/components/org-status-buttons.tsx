"use client"

import { useTransition } from "react"
import { Button } from "@workspace/ui/components/button"
import { suspendOrganizationAction, activateOrganizationAction } from "@/app/organizations/[id]/actions"

export function OrganizationStatusButtons({
  organizationId,
  currentStatus,
}: {
  organizationId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  if (currentStatus === "suspended") {
    return (
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await activateOrganizationAction(organizationId)
          })
        }}
      >
        {isPending ? "Activating..." : "Activate"}
      </Button>
    )
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await suspendOrganizationAction(organizationId)
        })
      }}
    >
      {isPending ? "Suspending..." : "Suspend"}
    </Button>
  )
}
