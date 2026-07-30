import "server-only"

import { ApplicationError, acceptSuperAdminInviteUseCase } from "@workspace/api"

/**
 * Claims a super-admin invitation and reports failure as a message rather than
 * throwing. Callers redirect on success, and `redirect()` signals by throwing —
 * so the try/catch has to stay off that path or it renders NEXT_REDIRECT as an
 * error to the user.
 */
export async function claimSuperAdminInvite(
  ctx: { userId: string; email: string },
  token: string
): Promise<string | null> {
  try {
    await acceptSuperAdminInviteUseCase(ctx, token)
    return null
  } catch (error) {
    // Only our own errors carry a message written for a person to read.
    return error instanceof ApplicationError
      ? error.message
      : "This invitation could not be completed."
  }
}
