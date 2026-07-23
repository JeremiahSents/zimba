import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findUserOrganizationMembership,
  findUserOrganizationMembershipBySlug,
} from "@workspace/db/repositories"

export async function getOrganizationMembershipUseCase(
  deps: { executor: DatabaseExecutor },
  userId: string,
  workspaceSlug?: string | null
) {
  const [membership] = workspaceSlug
    ? await findUserOrganizationMembershipBySlug(
        deps.executor,
        userId,
        workspaceSlug
      )
    : await findUserOrganizationMembership(deps.executor, userId)
  return membership ?? null
}
