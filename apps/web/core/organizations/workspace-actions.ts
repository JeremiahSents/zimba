"use server"

import {
  createWorkspaceUseCase,
  listUserWorkspacesUseCase,
  type UserWorkspaceList,
} from "@workspace/api"
import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { getSessionWithOrganization } from "@/core/auth/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"

export async function createWorkspaceAction(input: {
  name: string
}): Promise<ActionResult<{ slug: string }>> {
  const authFailure = await ensureActionSession("workspaces.create")
  if (authFailure) return authFailure

  const session = await getSessionWithOrganization()
  if (!session) {
    return expectedActionFailure("UNAUTHENTICATED", "Sign in to continue.")
  }

  try {
    const workspace = await createWorkspaceUseCase(
      { userId: session.user.id },
      input
    )
    // The switcher is rendered by the workspace layout, so every workspace
    // route holds a stale copy of the list until this clears it.
    revalidatePath("/", "layout")
    return { success: true, data: { slug: workspace.slug } }
  } catch (error) {
    return handleActionError(error, "workspaces.create")
  }
}

export async function listUserWorkspacesAction(): Promise<
  ActionResult<UserWorkspaceList>
> {
  const authFailure = await ensureActionSession("workspaces.list")
  if (authFailure) return authFailure

  const session = await getSessionWithOrganization()
  if (!session) {
    return expectedActionFailure("UNAUTHENTICATED", "Sign in to continue.")
  }

  try {
    return {
      success: true,
      data: await listUserWorkspacesUseCase(session.user.id),
    }
  } catch (error) {
    return handleActionError(error, "workspaces.list")
  }
}
