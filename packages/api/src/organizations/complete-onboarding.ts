import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  createOrganization,
  createOrganizationMember,
  findMembershipByUser,
  findOrganizationBySlug,
  updateUserName,
} from "@workspace/db/repositories"
import { validationError } from "../shared/application-error"

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

export async function completeOnboardingUseCase(
  ctx: { userId: string },
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  rawInput: unknown
) {
  if (!rawInput || typeof rawInput !== "object") validationError()
  const input = rawInput as { fullName?: unknown; companyName?: unknown }
  const fullName =
    typeof input.fullName === "string" ? input.fullName.trim() : ""
  const companyName =
    typeof input.companyName === "string" ? input.companyName.trim() : ""
  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    companyName.length < 2 ||
    companyName.length > 120
  )
    validationError("Enter a valid name and company name.")
  return deps.transaction(async (tx) => {
    const [existing] = await findMembershipByUser(tx, ctx.userId)
    if (existing) return { created: false as const }
    const base = slugify(companyName)
    const [taken] = await findOrganizationBySlug(tx, base)
    const slug = taken ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base
    const organizationId = crypto.randomUUID()
    await updateUserName(tx, ctx.userId, fullName)
    await createOrganization(tx, {
      id: organizationId,
      name: companyName,
      slug,
    })
    await createOrganizationMember(tx, {
      id: crypto.randomUUID(),
      organizationId,
      role: "owner",
      userId: ctx.userId,
    })
    return { created: true as const, slug }
  })
}
