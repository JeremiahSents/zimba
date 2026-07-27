import "server-only"

import { listTeamUseCase } from "@workspace/api"
import type { TeamMember } from "@/lib/types"

export type { TeamMember }

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
