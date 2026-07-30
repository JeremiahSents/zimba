import { db } from "@workspace/db"
import type { DatabaseExecutor } from "@workspace/db/executor"
import {
  createOrganization,
  createOrganizationMember,
  findActiveUserMemberships,
  isSlugAvailable,
  userOwnsAnyOrganization,
} from "@workspace/db/organizations"

import { forbidden, validationError } from "../shared/application-error"
import { isReservedSlug, normalizeSlug } from "../shared/workspace-slug"
import { createWorkspaceSchema } from "./schemas"

/** Guards against an unbounded loop if slug generation somehow never settles. */
const MAX_SLUG_ATTEMPTS = 50

/**
 * How many workspaces one person may own. Not a billing limit — a blast radius
 * limit, since creation is instant and unreviewed. Raise it when there is a
 * reason to.
 */
const MAX_OWNED_WORKSPACES = 10

export type CreateWorkspaceResult = {
  organizationId: string
  name: string
  slug: string
}

/**
 * Creates an additional workspace for someone who already owns one.
 *
 * Deliberately not the same path as onboarding: a brand-new company still goes
 * through the application and super-admin approval queue
 * (`approveOnboardingApplicationUseCase`). This is the self-serve path for
 * people that queue has already vetted, so it skips review and takes effect
 * immediately.
 */
export async function createWorkspaceUseCase(
  ctx: { userId: string },
  rawInput: unknown
): Promise<CreateWorkspaceResult> {
  const parsed = createWorkspaceSchema.safeParse(rawInput)
  if (!parsed.success) {
    validationError("Enter a workspace name.", {
      name: parsed.error.issues.map((issue) => issue.message),
    })
  }
  const { name } = parsed.data

  return db.transaction(async (tx) => {
    // Re-checked inside the transaction rather than trusted from the caller:
    // the action layer hides the button, this is what actually enforces it.
    if (!(await userOwnsAnyOrganization(tx, ctx.userId))) {
      forbidden(
        "Only a workspace owner can create another workspace. Apply from the onboarding form instead."
      )
    }

    const memberships = await findActiveUserMemberships(tx, ctx.userId)
    const owned = memberships.filter((m) => m.role === "owner").length
    if (owned >= MAX_OWNED_WORKSPACES) {
      validationError(
        `You can own up to ${MAX_OWNED_WORKSPACES} workspaces. Archive one before creating another.`
      )
    }

    const slug = await claimSlug(tx, name)
    const organizationId = crypto.randomUUID()

    await createOrganization(tx, { id: organizationId, name, slug })
    await createOrganizationMember(tx, {
      id: crypto.randomUUID(),
      organizationId,
      userId: ctx.userId,
      role: "owner",
    })

    return { organizationId, name, slug }
  })
}

/**
 * Walks `name`, `name-2`, `name-3`… until one is free. Checked against the
 * transaction, so a concurrent create is still caught by the unique index on
 * organization.slug rather than silently colliding.
 */
async function claimSlug(tx: DatabaseExecutor, name: string): Promise<string> {
  const base = normalizeSlug(name)
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    if (isReservedSlug(candidate)) continue
    if (await isSlugAvailable(tx, candidate)) return candidate
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}
