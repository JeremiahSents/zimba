import type { ReactNode } from "react"

type AdminDashboardShellProps = {
  children: ReactNode
}

export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
      {children}
    </div>
  )
}
