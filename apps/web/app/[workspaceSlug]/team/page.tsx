import { BoneCapture } from "@workspace/ui/components/bones"
import type { Metadata } from "next"

import { TeamPage } from "@/components/team/team-page"
import { listTeam } from "@/core/team/service"

export const metadata: Metadata = {
  title: "Team | Zimba",
  description: "Team access preview for Zimba construction project tracking.",
}

export default async function Page() {
  const team = await listTeam()
  // Also the source for `web-shell`, the generic workspace loading state used
  // by every route under [workspaceSlug] without a loading.tsx of its own.
  return (
    <BoneCapture name="web-shell">
      <TeamPage
        members={team.members.map((member) => ({
          ...member,
          responsibility: member.responsibility ?? "General access",
        }))}
        invitations={team.invitations}
        canInvite={team.canInvite}
      />
    </BoneCapture>
  )
}
