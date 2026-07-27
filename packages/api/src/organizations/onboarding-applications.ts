import { db } from "@workspace/db"
import type {
  OnboardingApplicationDto,
  OnboardingApplicationListDto,
} from "@workspace/contracts"

import {
  countPendingOnboardingApplications,
  createOnboardingApplication,
  createOrganization,
  createOrganizationMember,
  findMembershipByUser,
  findOnboardingApplicationById,
  findOrganizationBySlug,
  findPendingOnboardingApplication,
  listOnboardingApplicationsWithUser,
  updateOnboardingApplicationStatus,
  updateUserName,
} from "@workspace/db/repositories"
import {
  conflictError,
  notFoundError,
  validationError,
} from "../shared/application-error"

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

export async function submitOnboardingApplicationUseCase(
  ctx: { userId: string },
  input: {
    fullName: string
    email: string
    companyName: string
    companyWebsite?: string
    industry?: string
    country?: string
    phone?: string
    teamSize?: string
    useCase?: string
  }
): Promise<void> {
  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()
  const companyName = input.companyName.trim()
  if (fullName.length < 2 || fullName.length > 100)
    validationError("Enter a valid full name.")
  if (!email.includes("@")) validationError("Enter a valid email address.")
  if (companyName.length < 2 || companyName.length > 120)
    validationError("Enter a valid company name.")

  const [existing] = await findPendingOnboardingApplication(
    db,
    ctx.userId
  )
  if (existing && existing.status === "pending")
    conflictError("You already have a pending application.")

  await createOnboardingApplication(db, {
    userId: ctx.userId,
    fullName,
    email,
    companyName,
    companyWebsite: input.companyWebsite || null,
    industry: input.industry || null,
    country: input.country || null,
    phone: input.phone || null,
    teamSize: input.teamSize || null,
    useCase: input.useCase || null,
    status: "pending",
  })
}

export async function listOnboardingApplicationsUseCase(): Promise<OnboardingApplicationListDto[]> {
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
  return {
    id: app.id,
    userId: app.userId,
    fullName: app.fullName,
    email: app.email,
    companyName: app.companyName,
    companyWebsite: app.companyWebsite,
    industry: app.industry,
    country: app.country,
    phone: app.phone,
    teamSize: app.teamSize,
    useCase: app.useCase,
    status: app.status as OnboardingApplicationDto["status"],
    organizationId: app.organizationId,
    reviewedBy: app.reviewedBy,
    reviewedAt: app.reviewedAt,
    rejectionReason: app.rejectionReason,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }
}

export async function approveOnboardingApplicationUseCase(
  ctx: { reviewerId: string },
  applicationId: string
): Promise<{ organizationId: string; slug: string }> {
  const [app] = await findOnboardingApplicationById(
    db,
    applicationId
  )
  if (!app) notFoundError("Application not found.")
  if (app.status !== "pending")
    conflictError("This application has already been reviewed.")

  return db.transaction(async (tx) => {
    const [existing] = await findMembershipByUser(tx, app.userId)
    if (existing) conflictError("User already belongs to an organization.")

    const base = slugify(app.companyName)
    const [taken] = await findOrganizationBySlug(tx, base)
    const slug = taken ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base
    const organizationId = crypto.randomUUID()

    await updateUserName(tx, app.userId, app.fullName)

    await createOrganization(tx, {
      id: organizationId,
      name: app.companyName,
      slug,
      status: "active",
    })

    await createOrganizationMember(tx, {
      id: crypto.randomUUID(),
      organizationId,
      role: "owner",
      userId: app.userId,
    })

    await updateOnboardingApplicationStatus(tx, applicationId, {
      status: "approved",
      reviewedBy: ctx.reviewerId,
      reviewedAt: new Date(),
      organizationId,
    })

    return { organizationId, slug }
  })
}

export async function rejectOnboardingApplicationUseCase(
  ctx: { reviewerId: string },
  applicationId: string,
  rejectionReason?: string
): Promise<void> {
  const [app] = await findOnboardingApplicationById(
    db,
    applicationId
  )
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
  return {
    id: app.id,
    userId: app.userId,
    fullName: app.fullName,
    email: app.email,
    companyName: app.companyName,
    companyWebsite: app.companyWebsite,
    industry: app.industry,
    country: app.country,
    phone: app.phone,
    teamSize: app.teamSize,
    useCase: app.useCase,
    status: app.status as OnboardingApplicationDto["status"],
    organizationId: app.organizationId,
    reviewedBy: app.reviewedBy,
    reviewedAt: app.reviewedAt,
    rejectionReason: app.rejectionReason,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }
}
