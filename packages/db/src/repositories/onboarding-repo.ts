import { count, desc, eq } from "drizzle-orm"
import { onboardingApplication } from "../schemas/onboarding-schema"
import { organization } from "../schemas/organization-schema"
import type { DatabaseExecutor } from "./types"

export function createOnboardingApplication(
  executor: DatabaseExecutor,
  data: typeof onboardingApplication.$inferInsert
) {
  return executor.insert(onboardingApplication).values(data)
}

export function findPendingOnboardingApplication(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select()
    .from(onboardingApplication)
    .where(eq(onboardingApplication.userId, userId))
    .orderBy(desc(onboardingApplication.createdAt))
    .limit(1)
}

export function findOnboardingApplicationById(
  executor: DatabaseExecutor,
  id: string
) {
  return executor
    .select()
    .from(onboardingApplication)
    .where(eq(onboardingApplication.id, id))
    .limit(1)
}

export async function listOnboardingApplications(executor: DatabaseExecutor) {
  return executor
    .select({
      id: onboardingApplication.id,
      userId: onboardingApplication.userId,
      fullName: onboardingApplication.fullName,
      email: onboardingApplication.email,
      companyName: onboardingApplication.companyName,
      companyWebsite: onboardingApplication.companyWebsite,
      industry: onboardingApplication.industry,
      country: onboardingApplication.country,
      phone: onboardingApplication.phone,
      teamSize: onboardingApplication.teamSize,
      useCase: onboardingApplication.useCase,
      status: onboardingApplication.status,
      organizationId: onboardingApplication.organizationId,
      reviewedBy: onboardingApplication.reviewedBy,
      reviewedAt: onboardingApplication.reviewedAt,
      rejectionReason: onboardingApplication.rejectionReason,
      createdAt: onboardingApplication.createdAt,
      updatedAt: onboardingApplication.updatedAt,
    })
    .from(onboardingApplication)
    .orderBy(desc(onboardingApplication.createdAt))
}

export async function listOnboardingApplicationsWithUser(
  executor: DatabaseExecutor
) {
  return executor
    .select({
      id: onboardingApplication.id,
      fullName: onboardingApplication.fullName,
      email: onboardingApplication.email,
      companyName: onboardingApplication.companyName,
      industry: onboardingApplication.industry,
      country: onboardingApplication.country,
      status: onboardingApplication.status,
      createdAt: onboardingApplication.createdAt,
      organizationName: organization.name,
    })
    .from(onboardingApplication)
    .leftJoin(
      organization,
      eq(organization.id, onboardingApplication.organizationId)
    )
    .orderBy(desc(onboardingApplication.createdAt))
}

export async function updateOnboardingApplicationStatus(
  executor: DatabaseExecutor,
  id: string,
  data: {
    status: string
    reviewedBy: string
    reviewedAt: Date
    rejectionReason?: string | null
    organizationId?: string | null
  }
) {
  const [updated] = await executor
    .update(onboardingApplication)
    .set({
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason ?? null,
      organizationId: data.organizationId ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(onboardingApplication.id, id))
    .returning()
  return updated ?? null
}

export async function countPendingOnboardingApplications(
  executor: DatabaseExecutor
) {
  const [row] = await executor
    .select({ value: count() })
    .from(onboardingApplication)
    .where(eq(onboardingApplication.status, "pending"))
  return Number(row?.value ?? 0)
}
