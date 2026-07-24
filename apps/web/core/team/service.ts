import "server-only"

import {
  acceptInvitationUseCase,
  createInvitationUseCase,
  deleteInvitationUseCase,
  getInvitationPreviewUseCase,
  listTeamUseCase,
} from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { db } from "@workspace/db"
import { sendMemberInviteEmail } from "@workspace/transactional"
import { normalizeRole } from "../auth/permissions"
import { requireSession } from "../auth/service"
import { buildInviteUrl } from "./invite-url"

export async function listTeam() {
  const { organization } = await requireSession()
  const team = await listTeamUseCase(
    { organizationId: organization.organizationId },
    { executor: db }
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
    { transaction: (callback) => db.transaction(callback) },
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
      { executor: db },
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
    { executor: db, transaction: (callback) => db.transaction(callback) },
    token
  )
  return result.workspaceSlug
}

export async function getInvitationPreview(token: string) {
  return getInvitationPreviewUseCase({ executor: db }, token)
}
