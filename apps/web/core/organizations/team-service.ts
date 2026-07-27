import "server-only"

import { listTeamUseCase } from "@workspace/api"

export type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

export async function listTeamMembers(
  organizationId: string
): Promise<TeamMember[]> {
  const { members } = await listTeamUseCase({ organizationId })

  return members.map((m) => ({
    id: m.userId,
    name: m.name,
    email: m.email,
    role: m.role,
  }))
}
