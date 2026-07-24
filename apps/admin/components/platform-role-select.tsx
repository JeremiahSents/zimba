"use client"

import { useTransition } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
    <Select
      value={currentRole}
      disabled={isPending}
      onValueChange={(val) => {
        if (!val) return
        startTransition(async () => {
          await updatePlatformUserRoleAction(userId, val)
        })
      }}
    >
      <SelectTrigger size="sm" className="h-9 w-44 rounded-xl capitalize">
        <SelectValue placeholder={currentRole} />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((role) => (
          <SelectItem key={role} value={role} className="capitalize">
            {role === "none" ? "No platform access" : role.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      className="rounded-xl"
    >
      {isPending ? "Removing..." : "Remove Platform Access"}
    </Button>
  )
}
