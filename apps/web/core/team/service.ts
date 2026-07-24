import "server-only"

import {
  acceptInvitationUseCase,
  createInvitationUseCase,
  deleteInvitationUseCase,
  getInvitationPreviewUseCase,
  listTeamUseCase,
} from "@workspace/api"
import {
  apiDatabase,
  apiExecutor,
  apiTransaction,
} from "@workspace/api-runtime"
import type { WorkspaceRole } from "@workspace/contracts"
import { sendMemberInviteEmail } from "@workspace/transactional"
import { normalizeRole } from "../auth/permissions"
import { requireSession } from "../auth/service"
import { buildInviteUrl } from "./invite-url"

export async function listTeam() {
  const { organization } = await requireSession()
  const team = await listTeamUseCase(
    { organizationId: organization.organizationId },
    apiExecutor
  )
  return {
    members: team.members,
    invitations: team.invitations,
    canInvite: ["owner", "site_manager"].includes(
      normalizeRole(organization.role)
    ),
  }
}

export async function createInvitation(input: {
  email: string
  role: WorkspaceRole
}) {
  const { user, organization } = await requireSession()
  const created = await createInvitationUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role),
    },
    apiTransaction,
    input
  )
  const inviteUrl = buildInviteUrl(created.token)
  try {
    await sendMemberInviteEmail({
      to: created.email,
      invitedByName: user.name,
      organizationName: organization.organizationName,
      role: created.role,
      inviteUrl,
    })
  } catch (error) {
    await deleteInvitationUseCase(
      { organizationId: organization.organizationId },
      apiExecutor,
      created.invitationId
    )
    throw error
  }
  return created.token
}

export async function acceptInvitation(token: string) {
  const { user } = await requireSession()
  const result = await acceptInvitationUseCase(
    { userId: user.id, email: user.email },
    apiDatabase,
    token
  )
  return result.workspaceSlug
}

export async function getInvitationPreview(token: string) {
  return getInvitationPreviewUseCase(apiExecutor, token)
}
