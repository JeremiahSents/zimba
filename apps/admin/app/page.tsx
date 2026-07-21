import { redirect } from "next/navigation"
import { getPlatformSession } from "../core/auth/service"

export default async function Home() {
  const session = await getPlatformSession()
  if (!session) redirect("/login")
  if (session.platformRole !== "super_admin" && session.platformRole !== "support") {
    redirect("https://zimba.digital")
  }
  redirect("/overview")
}
