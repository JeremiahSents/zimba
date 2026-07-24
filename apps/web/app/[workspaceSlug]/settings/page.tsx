import type { Metadata } from "next"

import { SettingsPage } from "@/components/settings/settings-page"
import { requireSession } from "@/core/auth/service"
import { listTeamMembers } from "@/core/organizations/team-service"

export const metadata: Metadata = {
  title: "Settings | Zimba",
  description: "Settings preview for Zimba construction project tracking.",
}

export default async function Page() {
  const { organization } = await requireSession()
  const isOwner = organization.role === "owner"
  const members = isOwner
    ? await listTeamMembers(organization.organizationId)
    : []

  return (
    <SettingsPage
      company={organization.organizationName}
      role={organization.role}
      isOwner={isOwner}
      teamMembers={members}
    />
  )
}
