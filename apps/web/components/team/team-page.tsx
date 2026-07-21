"use client"

import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import { inviteMemberAction } from "@/app/admin/team/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import { TeamTable } from "@/components/team/team-table"
import type { PublicError } from "@/core/shared/errors"
import type { TeamMember } from "@/lib/types"

const inviteRoles = [
  { label: "Site manager", value: "site_manager" },
  { label: "Accountant", value: "accountant" },
  { label: "Viewer", value: "viewer" },
  { label: "Owner", value: "owner" },
] as const

type InviteRole = (typeof inviteRoles)[number]["value"]

export function TeamPage({
  members,
  invitations,
  canInvite,
}: {
  members: TeamMember[]
  invitations: { id: string; email: string; role: string }[]
  canInvite: boolean
}) {
  const [showInvite, setShowInvite] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<PublicError | null>(null)
  const [inviteRole, setInviteRole] = useState<InviteRole>("site_manager")
  const stats = [
    ["Team members", String(members.length), "With dashboard access"],
    [
      "Managers",
      String(
        members.filter((member) =>
          ["owner", "site_manager", "Owner / Admin", "Site manager"].includes(
            member.role
          )
        ).length
      ),
      "Owner and site manager roles",
    ],
    [
      "Pending invites",
      String(invitations.length),
      "Invitation links awaiting acceptance",
    ],
  ]
  return (
    <DashboardShell
      title="Team"
      subtitle="Manage project roles, approvals, and access levels."
    >
      <Card className="gap-0 py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1">
          {stats.map(([label, value, detail]) => (
            <div
              key={label}
              className="border-t p-4 first:border-t-0 even:border-l md:border-t-0 md:border-l md:p-5 md:first:border-l-0"
            >
              <p className="font-medium text-foreground text-xs">{label}</p>
              <p className="mt-5 font-heading font-semibold text-base text-foreground">
                {value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Team access</CardTitle>
            <CardDescription>
              Invite people and manage access roles.
            </CardDescription>
          </div>
          {canInvite && (
            <Button size="sm" onClick={() => setShowInvite((value) => !value)}>
              <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={1.5} />
              Invite member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showInvite && (
            <form
              className="mb-6 grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2"
              action={async (formData) => {
                const result = await inviteMemberAction({
                  email: String(formData.get("email")),
                  role: inviteRole,
                })
                setError(null)
                if (!result.success) return setError(result.error)
                setMessage(result.data.message)
              }}
            >
              <div>
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) =>
                    setInviteRole((value ?? "site_manager") as InviteRole)
                  }
                >
                  <SelectTrigger id="invite-role" className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inviteRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Send invitation</Button>
                {error && (
                  <div className="mt-2">
                    <ErrorNotice error={error} />
                  </div>
                )}
                {message && (
                  <p
                    className="mt-2 text-muted-foreground text-sm"
                    role="status"
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
          )}
          <TeamTable members={members} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
