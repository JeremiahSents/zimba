import { db } from "@workspace/db"
import { updateUserName } from "@workspace/db/auth"
import {
  countPendingOnboardingApplications,
  createOnboardingApplication,
  findApprovedOnboardingApplicationByEmail,
  findLatestOnboardingApplicationByEmail,
  findOnboardingApplicationById,
  findPendingOnboardingApplication,
  linkOnboardingApplicationUser,
  listOnboardingApplicationsWithUser,
  updateOnboardingApplicationStatus,
} from "@workspace/db/onboarding"
import type { onboardingApplication } from "@workspace/db/onboarding/schema"
import {
  createOrganization,
  createOrganizationMember,
  findMembershipByUser,
  findOrganizationById,
  findOrganizationBySlug,
} from "@workspace/db/organizations"
import type { z } from "zod"
import type {
  OnboardingApplicationDto,
  OnboardingApplicationListDto,
} from "../schemas"
import {
  conflictError,
  notFoundError,
  validationError,
} from "../shared/application-error"
import { onboardingApplicationSchema } from "./onboarding-schemas"

function toApplicationDto(
  row: typeof onboardingApplication.$inferSelect
): OnboardingApplicationDto {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    email: row.email,
    companyName: row.companyName,
    companyWebsite: row.companyWebsite,
    industry: row.industry,
    country: row.country,
    phone: row.phone,
    teamSize: row.teamSize,
    useCase: row.useCase,
    status: row.status as OnboardingApplicationDto["status"],
    organizationId: row.organizationId,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function slugify(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 54) || "company"
  )
}

/**
 * A demo request, not a workspace, and submitted by someone with no account:
 * the form lives on the marketing site. Nothing is provisioned here — a super
 * admin has to approve the request, and the applicant registers afterwards.
 */
export async function submitOnboardingApplicationUseCase(
  input: unknown
): Promise<OnboardingApplicationDto> {
  const parsed = onboardingApplicationSchema.safeParse(input)
  if (!parsed.success) {
    validationError(
      "Check the highlighted details and try again.",
      fieldErrorsOf(parsed.error)
    )
  }

  const fullName = parsed.data.fullName
  const email = parsed.data.email.toLowerCase()
  const companyName = parsed.data.companyName

  const [existing] = await findLatestOnboardingApplicationByEmail(db, email)
  if (existing && existing.status === "pending")
    conflictError("We already have a pending request for this email address.")

  const created = await createOnboardingApplication(db, {
    userId: null,
    fullName,
    email,
    companyName,
    companyWebsite: parsed.data.companyWebsite || null,
    industry: parsed.data.industry || null,
    country: parsed.data.country || null,
    phone: parsed.data.phone || null,
    teamSize: parsed.data.teamSize || null,
    useCase: parsed.data.useCase || null,
    status: "pending",
  })
  if (!created) conflictError("We could not record your request.")

  return toApplicationDto(created)
}

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== "string") continue
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return fieldErrors
}

export async function listOnboardingApplicationsUseCase(): Promise<
  OnboardingApplicationListDto[]
> {
  const rows = await listOnboardingApplicationsWithUser(db)
  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    companyName: row.companyName,
    industry: row.industry,
    country: row.country,
    status: row.status as OnboardingApplicationListDto["status"],
    createdAt: row.createdAt,
  }))
}

export async function getOnboardingApplicationDetailUseCase(
  id: string
): Promise<OnboardingApplicationDto | null> {
  const [app] = await findOnboardingApplicationById(db, id)
  if (!app) return null
  return toApplicationDto(app)
}

export async function approveOnboardingApplicationUseCase(
  ctx: { reviewerId: string },
  applicationId: string
): Promise<{ organizationId: string; slug: string }> {
  const [app] = await findOnboardingApplicationById(db, applicationId)
  if (!app) notFoundError("Application not found.")
  if (app.status !== "pending")
    conflictError("This application has already been reviewed.")

  const applicantUserId = app.userId

  return db.transaction(async (tx) => {
    if (applicantUserId) {
      const [existing] = await findMembershipByUser(tx, applicantUserId)
      if (existing) conflictError("User already belongs to an organization.")
    }

    const base = slugify(app.companyName)
    const [taken] = await findOrganizationBySlug(tx, base)
    const slug = taken ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base
    const organizationId = crypto.randomUUID()

    await createOrganization(tx, {
      id: organizationId,
      name: app.companyName,
      slug,
      status: "active",
    })

    // Most applicants have no account yet — the workspace waits for them and
    // claimApprovedApplicationUseCase makes them owner when they register.
    if (applicantUserId) {
      await updateUserName(tx, applicantUserId, app.fullName)
      await createOrganizationMember(tx, {
        id: crypto.randomUUID(),
        organizationId,
        role: "owner",
        userId: applicantUserId,
      })
    }

    await updateOnboardingApplicationStatus(tx, applicationId, {
      status: "approved",
      reviewedBy: ctx.reviewerId,
      reviewedAt: new Date(),
      organizationId,
    })

    return { organizationId, slug }
  })
}

/**
 * Called right after a user registers. If their email matches an approved demo
 * request whose workspace is still unclaimed, they become its owner — this is
 * what replaces the old sign-in-then-apply flow.
 */
export async function claimApprovedApplicationUseCase(ctx: {
  userId: string
  email: string
}): Promise<{ organizationId: string; slug: string } | null> {
  const email = ctx.email.toLowerCase()
  const [app] = await findApprovedOnboardingApplicationByEmail(db, email)
  if (!app?.organizationId) return null
  if (app.userId) return null

  // Narrowed here so the transaction closure keeps the non-null type.
  const approvedOrganizationId = app.organizationId

  return db.transaction(async (tx) => {
    const [existing] = await findMembershipByUser(tx, ctx.userId)
    if (existing) return null

    const [organization] = await findOrganizationById(
      tx,
      approvedOrganizationId
    )
    if (!organization) return null

    await createOrganizationMember(tx, {
      id: crypto.randomUUID(),
      organizationId: organization.id,
      role: "owner",
      userId: ctx.userId,
    })

    await updateUserName(tx, ctx.userId, app.fullName)
    await linkOnboardingApplicationUser(tx, app.id, ctx.userId)

    return { organizationId: organization.id, slug: organization.slug }
  })
}

export async function rejectOnboardingApplicationUseCase(
  ctx: { reviewerId: string },
  applicationId: string,
  rejectionReason?: string
): Promise<void> {
  const [app] = await findOnboardingApplicationById(db, applicationId)
  if (!app) notFoundError("Application not found.")
  if (app.status !== "pending")
    conflictError("This application has already been reviewed.")

  await updateOnboardingApplicationStatus(db, applicationId, {
    status: "rejected",
    reviewedBy: ctx.reviewerId,
    reviewedAt: new Date(),
    rejectionReason: rejectionReason || null,
  })
}

export async function getPendingApplicationCountUseCase(): Promise<number> {
  return countPendingOnboardingApplications(db)
}

export async function getOnboardingApplicationForUserUseCase(
  userId: string
): Promise<OnboardingApplicationDto | null> {
  const [app] = await findPendingOnboardingApplication(db, userId)
  if (!app) return null
  return toApplicationDto(app)
}

/**
 * Demo requests are keyed by email, not by account, so this is how a signed-in
 * user finds the request they submitted before they had an account.
 */
export async function getOnboardingApplicationByEmailUseCase(
  email: string
): Promise<OnboardingApplicationDto | null> {
  const [app] = await findLatestOnboardingApplicationByEmail(
    db,
    email.toLowerCase()
  )
  if (!app) return null
  return toApplicationDto(app)
}
