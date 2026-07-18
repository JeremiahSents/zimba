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
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { TeamTable } from "@/components/team/team-table"
import type { TeamMember } from "@/lib/types"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useState } from "react"
import { inviteMemberAction } from "@/app/admin/team/actions"

export function TeamPage({ members, invitations, canInvite }: { members: TeamMember[]; invitations: { id: string; name: string; email: string; role: string }[]; canInvite: boolean }) {
  const [showInvite, setShowInvite] = useState(false)
  const [message, setMessage] = useState("")
  const stats = [
    ["Team members", String(members.length), "With dashboard access"],
    ["Managers", String(members.filter((member) => ["owner", "site_manager", "Owner / Admin", "Site manager"].includes(member.role)).length), "Owner and site manager roles"],
    ["Pending invites", String(invitations.length), "Invitation links awaiting acceptance"],
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
              Roles and responsibilities across the dashboard.
            </CardDescription>
          </div>
          {canInvite && <Button size="sm" onClick={() => setShowInvite((value) => !value)}>
            <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={1.5} />
            Invite member
          </Button>}
        </CardHeader>
        <CardContent>
          {showInvite && <form className="mb-6 grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2" action={async (formData) => {
            const result = await inviteMemberAction({ name: String(formData.get("name")), email: String(formData.get("email")), role: String(formData.get("role")) as "owner" | "site_manager" | "accountant" | "viewer", responsibility: String(formData.get("responsibility")) })
            if (!result.success) return setMessage(result.error.message)
            const url = `${window.location.origin}${result.data.path}`
            await navigator.clipboard.writeText(url)
            setMessage("Invitation link copied. Share it with the team member; it expires in 7 days.")
          }}>
            <div><Label htmlFor="invite-name">Name</Label><Input id="invite-name" name="name" required /></div>
            <div><Label htmlFor="invite-email">Email</Label><Input id="invite-email" name="email" type="email" required /></div>
            <div><Label htmlFor="invite-role">Role</Label><select id="invite-role" name="role" className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"><option value="site_manager">Site manager</option><option value="accountant">Accountant</option><option value="viewer">Viewer</option><option value="owner">Owner</option></select></div>
            <div><Label htmlFor="responsibility">Responsibility</Label><Input id="responsibility" name="responsibility" placeholder="e.g. Kampala site" /></div>
            <div className="sm:col-span-2"><Button type="submit">Create and copy invitation</Button>{message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}</div>
          </form>}
          <TeamTable members={members} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
