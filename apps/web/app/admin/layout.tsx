import { db, findUserOrganizationMembership } from "@workspace/db"
import { redirect } from "next/navigation"
import { getSessionWithOrganization } from "@/core/auth/service"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
  modal?: React.ReactNode
}>) {
  const session = await getSessionWithOrganization()
  if (!session) redirect("/login")
  if (!session.organization) redirect("/onboarding")

  const [membership] = await findUserOrganizationMembership(db, session.user.id)
  const slug = membership?.slug ?? session.organization.organizationId
  redirect(`/${slug}`)
}
