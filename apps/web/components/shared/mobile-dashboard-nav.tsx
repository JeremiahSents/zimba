"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FocusEvent, useEffect, useState } from "react"
import {
  isDashboardRouteActive,
  mobilePrimaryNavigation,
} from "@/components/shared/dashboard-navigation"

export function MobileDashboardNav() {
  const pathname = usePathname()
  const [isScrolling, setIsScrolling] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const isExpanded = isScrolling || hasFocus

  useEffect(() => {
    let scrollEndTimer: number | undefined

    const handleScroll = () => {
      setIsScrolling(true)
      window.clearTimeout(scrollEndTimer)
      scrollEndTimer = window.setTimeout(() => setIsScrolling(false), 700)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.clearTimeout(scrollEndTimer)
    }
  }, [])

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null
    if (!event.currentTarget.contains(nextFocusedElement)) {
      setHasFocus(false)
    }
  }

  return (
    <nav
      aria-label="Dashboard navigation"
      data-expanded={isExpanded}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={handleBlur}
      className={`fixed right-2 bottom-[var(--navbar-offset)] left-2 z-40 mx-auto border border-white/80 bg-background shadow-[0_18px_45px_-20px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[22px] backdrop-saturate-150 transition-[max-width,height,padding,border-radius] duration-200 ease-[var(--ease-out-ui)] motion-reduce:transition-none sm:right-3 sm:left-3 md:hidden ${isExpanded ? "h-[var(--navbar-height)] max-w-[440px] rounded-[22px] p-2" : "h-14 max-w-[248px] rounded-[18px] p-1.5"}`}
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
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full transition-[color,background-color,transform] duration-200 ease-[var(--ease-out-ui)] group-data-[active=true]/nav-item:bg-primary group-data-[active=true]/nav-item:text-white motion-reduce:transition-none ${isExpanded ? "-translate-y-1.5" : "translate-y-0"}`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="size-4"
                />
              </span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-1 bottom-1.5 truncate text-center leading-none transition-[opacity,transform] duration-150 ease-[var(--ease-out-ui)] motion-reduce:transition-none motion-reduce:delay-0 ${isExpanded ? "translate-y-0 opacity-100 delay-75" : "translate-y-1 opacity-0"}`}
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
