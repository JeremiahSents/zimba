import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/core/auth/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/")
  return <LoginForm />
}
