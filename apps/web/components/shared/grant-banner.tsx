"use client"

import { useState } from "react"
import { exitWorkspaceGrantAction } from "@/core/auth/grant-actions"

export function GrantBanner({
  organizationName,
}: {
  organizationName: string
}) {
  const [exiting, setExiting] = useState(false)

  async function handleExit() {
    setExiting(true)
    await exitWorkspaceGrantAction()
  }

  return (
    <div className="flex items-center justify-between gap-3 border-amber-500/30 border-b bg-amber-500/10 px-4 py-2 text-sm">
      <p className="text-amber-900 dark:text-amber-200">
        You are acting on behalf of <strong>{organizationName}</strong>. Every
        action is recorded against your account.
      </p>
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        className="shrink-0 rounded-md bg-amber-600 px-3 py-1 font-medium text-white text-xs transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {exiting ? "Exiting…" : "Exit"}
      </button>
    </div>
  )
}
