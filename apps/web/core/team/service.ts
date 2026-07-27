import "server-only"

import type { WorkspaceRole } from "@workspace/api"
import {
  acceptInvitationUseCase,
  createInvitationUseCase,
  deleteInvitationUseCase,
  getInvitationPreviewUseCase,
  listTeamUseCase,
} from "@workspace/api"
import { sendMemberInviteEmail } from "@workspace/transactional"
import { normalizeRole } from "../auth/permissions"
import { getSessionWithOrganization, requireSession } from "../auth/service"
import { unauthorized } from "../shared/errors"
import { buildInviteUrl } from "./invite-url"

export async function listTeam() {
  const { organization } = await requireSession()
  const team = await listTeamUseCase({
    organizationId: organization.organizationId,
  })
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
      created.invitationId
    )
    throw error
  }
  return created.token
}

export async function acceptInvitation(token: string) {
  const session = await getSessionWithOrganization()
  if (!session) unauthorized("Sign in to accept your invitation.")
  const result = await acceptInvitationUseCase(
    { userId: session.user.id, email: session.user.email },
    token
  )
  return result.workspaceSlug
}

export async function getInvitationPreview(token: string) {
  return getInvitationPreviewUseCase(token)
}
