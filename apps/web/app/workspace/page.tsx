import { listUserWorkspacesUseCase } from "@workspace/api"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { LAST_WORKSPACE_COOKIE } from "@/lib/workspace-cookie"

export const dynamic = "force-dynamic"

export default async function WorkspaceEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login?callbackUrl=/workspace")

  const { workspaces } = await listUserWorkspacesUseCase(session.user.id)
  const target = await pickWorkspace(workspaces)
  if (target) redirect(`/${target}/home`)

  // No membership means either a request still under review or none at all;
  // /pending-approval explains both.
  redirect("/pending-approval")
}

/**
 * The cookie is a hint, not authority: it is honoured only when it still names
 * a workspace the caller can actually reach, so a stale or hand-edited value
 * falls back to their first membership rather than a 404.
 */
async function pickWorkspace(
  workspaces: Array<{ slug: string }>
): Promise<string | null> {
  if (workspaces.length === 0) return null
  const cookieStore = await cookies()
  const remembered = cookieStore.get(LAST_WORKSPACE_COOKIE)?.value
  const match = workspaces.find((workspace) => workspace.slug === remembered)
  return (match ?? workspaces[0])?.slug ?? null
}
