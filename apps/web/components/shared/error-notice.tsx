"use client"

import { Button } from "@workspace/ui/components/button"
import type { PublicError } from "@/core/shared/errors"

type ErrorNoticeProps = {
  error: PublicError | string
  onRetry?: () => void
  className?: string
}

const actionLabels: Record<PublicError["recoveryAction"], string> = {
  RETRY: "Try again",
  RELOAD: "Reload",
  CHECK_CONNECTION: "Try again",
  SIGN_IN: "Sign in",
  CORRECT_INPUT: "Review fields",
  GO_BACK: "Go back",
  CONTACT_SUPPORT: "Contact support",
}

export function ErrorNotice({ error, onRetry, className }: ErrorNoticeProps) {
  const detail = typeof error === "string" ? undefined : error
  const message = typeof error === "string" ? error : error.message

  function recover() {
    if (
      onRetry &&
      (!detail ||
        detail.recoveryAction === "RETRY" ||
        detail.recoveryAction === "CHECK_CONNECTION")
    ) {
      onRetry()
      return
    }
    switch (detail?.recoveryAction) {
      case "SIGN_IN":
        window.location.assign("/login")
        break
      case "GO_BACK":
        window.history.back()
        break
      case "CONTACT_SUPPORT":
        window.location.assign("mailto:support@zimba.app")
        break
      default:
        window.location.reload()
    }
  }

  const showAction = Boolean(
    onRetry || (detail && detail.recoveryAction !== "CORRECT_INPUT")
  )

  return (
    <div
      className={
        className ??
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3"
      }
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0">
        <p className="font-medium text-destructive text-sm">{message}</p>
      </div>
      {showAction ? (
        <Button type="button" variant="secondary" size="sm" onClick={recover}>
          {detail ? actionLabels[detail.recoveryAction] : "Try again"}
        </Button>
      ) : null}
    </div>
  )
}
