"use server"

import { db } from "@workspace/db"
import {
  createOrganization,
  createOrganizationMember,
  findMembershipByUser,
  findOrganizationBySlug,
  updateUserName,
} from "@workspace/db/repositories"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "@/core/organizations/service"

export type OnboardingState = {
  error?: string
  fieldErrors?: {
    companyName?: string
    fullName?: string
  }
}

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const fullName = String(formData.get("fullName") ?? "").trim()
  const companyName = String(formData.get("companyName") ?? "").trim()
  const fieldErrors: OnboardingState["fieldErrors"] = {}

  if (fullName.length < 2 || fullName.length > 100) {
    fieldErrors.fullName = "Enter your full name."
  }
  if (companyName.length < 2 || companyName.length > 120) {
    fieldErrors.companyName = "Enter your company name."
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const existingMembership = await getOrganizationMembership(session.user.id)
  if (existingMembership) redirect("/admin/home")

  try {
    await db.transaction(async (tx) => {
      const [membership] = await findMembershipByUser(tx, session.user.id)

      if (membership) return

      const organizationId = crypto.randomUUID()
      const slug = await createAvailableSlug(tx, companyName)

      await updateUserName(tx, session.user.id, fullName)

      await createOrganization(tx, {
        id: organizationId,
        name: companyName,
        slug,
      })

      await createOrganizationMember(tx, {
        id: crypto.randomUUID(),
        organizationId,
        role: "owner",
        userId: session.user.id,
      })
    })
  } catch (error) {
    console.error("Organization onboarding failed", error)
    return {
      error: "We could not create your company workspace. Please try again.",
    }
  }

  redirect("/admin/home")
}

async function createAvailableSlug(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  companyName: string
) {
  const base =
    companyName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 54) || "company"

  const [existing] = await findOrganizationBySlug(tx, base)

  if (!existing) return base
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}
