import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password | Zimba",
  description: "Choose a new password for your Zimba account.",
}

export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm
          token={token ?? null}
          linkError={error === "INVALID_TOKEN"}
        />
      </div>
    </div>
  )
}
