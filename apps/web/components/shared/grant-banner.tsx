"use client"

import { Logout03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { useState } from "react"
import { useWorkspace } from "@/components/shared/workspace-context"
import { exitWorkspaceGrantAction } from "@/core/auth/grant-actions"

/**
 * Shown in the sidebar footer while platform staff are acting on a customer
 * workspace through a grant. Renders nothing for ordinary members.
 */
export function GrantBanner() {
  const user = useWorkspace()
  const { state } = useSidebar()
  const [exiting, setExiting] = useState(false)

  if (!user.viaGrant) return null

  async function handleExit() {
    setExiting(true)
    await exitWorkspaceGrantAction()
  }

  if (state === "collapsed") {
    return (
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        aria-label={`Exit staff access to ${user.organizationName}`}
        title={`Staff access · Exit ${user.organizationName}`}
        className="mx-auto grid size-10 place-items-center rounded-full bg-amber-500/15 text-amber-700 outline-none transition-colors hover:bg-amber-500/25 disabled:opacity-50 dark:text-amber-300"
      >
        <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.8} className="size-4" />
      </button>
    )
  }

  return (
    <div className="mb-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
      <p className="font-medium text-[11px] text-amber-900 leading-snug dark:text-amber-200">
        Staff access
      </p>
      <p className="mt-0.5 text-[10px] text-amber-800/80 leading-snug dark:text-amber-200/70">
        Actions are recorded against your account.
      </p>
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 font-medium text-white text-xs outline-none transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.8} className="size-3.5" />
        {exiting ? "Exiting…" : "Exit workspace"}
      </button>
    </div>
  )
}
