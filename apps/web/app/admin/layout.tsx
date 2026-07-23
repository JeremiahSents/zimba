import { db, findUserOrganizationMembership } from "@workspace/db"
import { redirect } from "next/navigation"
import { getSessionWithOrganization } from "@/core/auth/service"

export default async function AdminLayout() {
  const session = await getSessionWithOrganization()
  if (!session) redirect("/login")
  if (!session.organization) redirect("/onboarding")

  const [membership] = await findUserOrganizationMembership(db, session.user.id)
  const slug = membership?.slug ?? session.organization.slug
  redirect(`/${slug}/home`)
}
