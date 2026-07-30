import { BoneCapture } from "@workspace/ui/components/bones"
import type { ReactNode } from "react"

type AdminDashboardShellProps = {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  /**
   * Marks this page's layout for bone capture. Must match the name the route's
   * loading.tsx replays. Omit on pages that have no loading route.
   */
  boneName?: string
}

export function AdminDashboardShell({
  title,
  description,
  action,
  children,
  boneName,
}: AdminDashboardShellProps) {
  const shell = (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  )

  if (!boneName) return shell

  return <BoneCapture name={boneName}>{shell}</BoneCapture>
}
