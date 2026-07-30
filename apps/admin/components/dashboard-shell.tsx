import { BoneCapture } from "@workspace/ui/components/bones"
import type { ReactNode } from "react"

type AdminDashboardShellProps = {
  children: ReactNode
  /**
   * Marks this page's layout for bone capture. Must match the name the route's
   * loading.tsx replays. Omit on pages that have no loading route.
   */
  boneName?: string
}

export function AdminDashboardShell({
  children,
  boneName,
}: AdminDashboardShellProps) {
  const shell = (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
      {children}
    </div>
  )

  if (!boneName) return shell

  return <BoneCapture name={boneName}>{shell}</BoneCapture>
}
