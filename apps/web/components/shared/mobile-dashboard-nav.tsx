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
      className="fixed right-2 bottom-[var(--navbar-offset)] left-2 z-40 mx-auto h-[var(--navbar-height)] max-w-[440px] rounded-[22px] border border-white/80 bg-background p-2 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[22px] backdrop-saturate-150 sm:right-3 sm:left-3 md:hidden"
    >
      <div className="grid h-full grid-cols-4 gap-1">
        {mobilePrimaryNavigation.map((item) => {
          const active = isDashboardRouteActive(pathname, item.href)
          return (
            <Link
              key={item.title}
              href={item.href}
              aria-label={item.title}
              aria-current={active ? "page" : undefined}
              className="group/nav-item relative flex min-h-11 min-w-0 items-center justify-center rounded-2xl px-1 font-medium text-[9px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.97] data-[active=true]:bg-success/10 data-[active=true]:text-success min-[360px]:text-[10px]"
              data-active={active}
            >
              <span className="grid size-7 shrink-0 -translate-y-1.5 place-items-center rounded-full transition-[color,background-color] duration-150 ease-out group-data-[active=true]/nav-item:bg-primary group-data-[active=true]/nav-item:text-white motion-reduce:transition-none">
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="size-4"
                />
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-1 bottom-1.5 truncate text-center leading-none"
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
