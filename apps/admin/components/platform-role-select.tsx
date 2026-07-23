"use client"

import { Button } from "@workspace/ui/components/button"
import { useTransition } from "react"
import {
  removePlatformUserAction,
  updatePlatformUserRoleAction,
} from "@/core/users/actions"

const ROLE_OPTIONS = ["none", "support", "super_admin"] as const

export function PlatformRoleSelect({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={currentRole}
      disabled={isPending}
      onChange={(e) => {
        startTransition(async () => {
          await updatePlatformUserRoleAction(userId, e.target.value)
        })
      }}
      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm capitalize shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role} className="capitalize">
          {role === "none" ? "No platform access" : role.replace("_", " ")}
        </option>
      ))}
    </select>
  )
}

export function RemovePlatformAccessButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await removePlatformUserAction(userId)
        })
      }}
    >
      {isPending ? "Removing..." : "Remove Platform Access"}
    </Button>
  )
}
