import type { Metadata } from "next"

import { TeamPage } from "@/components/team/team-page"
import { listTeam } from "@/core/team/service"

export const metadata: Metadata = {
  title: "Team | Zimba",
  description: "Team access preview for Zimba construction project tracking.",
}

export default async function Page() {
  const team = await listTeam()
  return (
    <TeamPage
      members={team.members.map((member) => ({
        ...member,
        responsibility: member.responsibility ?? "General access",
      }))}
      invitations={team.invitations}
      canInvite={team.canInvite}
    />
  )
}
