"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  isDashboardRouteActive,
  mobilePrimaryNavigation,
} from "@/components/shared/dashboard-navigation"

export function MobileDashboardNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Dashboard navigation"
      className="fixed right-2 bottom-[var(--navbar-offset)] left-2 z-40 mx-auto h-[var(--navbar-height)] max-w-[440px] rounded-[22px] border border-white/75 bg-background/82 p-2 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[18px] backdrop-saturate-150 supports-[not_(backdrop-filter:blur(1px))]:bg-background sm:right-3 sm:left-3 md:hidden"
    >
      <div className="grid h-full grid-cols-4 gap-1">
        {mobilePrimaryNavigation.map((item) => {
          const active = isDashboardRouteActive(pathname, item.href)
          return (
            <Link
              key={item.title}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="group/nav-item flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 font-medium text-[9px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.97] data-[active=true]:bg-success/10 data-[active=true]:text-success min-[360px]:text-[10px]"
              data-active={active}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full transition-colors group-data-[active=true]/nav-item:bg-primary group-data-[active=true]/nav-item:text-white">
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="size-4"
                />
              </span>
              <span className="max-w-full truncate leading-none">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
