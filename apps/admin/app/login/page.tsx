import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { auth } from "@/core/auth/auth"

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/")
  return <LoginForm />
}
