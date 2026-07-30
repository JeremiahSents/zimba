"use client"

import { toast } from "@workspace/ui/components/sonner"
import { authClient } from "@/lib/auth-client"

/**
 * A single, stable toast rather than a transient one. Signing up no longer signs
 * you in, so this notice is the only thing telling someone what to do next —
 * letting it auto-dismiss would leave the form looking like nothing happened.
 * Re-raising it under the same id updates the wording in place instead of
 * stacking duplicates.
 */
const toastId = "email-verification"

export function showVerificationToast(
  email: string,
  callbackUrl: string,
  note?: string
) {
  toast.info("Confirm your email to continue", {
    id: toastId,
    duration: Number.POSITIVE_INFINITY,
    description:
      note ??
      `We sent a confirmation link to ${email}. Open it and you'll be signed in — after that, Google sign-in works on this account too.`,
    action: {
      label: "Send it again",
      onClick: () => {
        void resendVerification(email, callbackUrl)
      },
    },
  })
}

async function resendVerification(email: string, callbackUrl: string) {
  const result = await authClient.sendVerificationEmail({
    email,
    callbackURL: callbackUrl,
  })

  showVerificationToast(
    email,
    callbackUrl,
    result?.error
      ? `We could not send it: ${result.error.message ?? "try again shortly"}.`
      : `Sent again just now — check ${email}.`
  )
}
