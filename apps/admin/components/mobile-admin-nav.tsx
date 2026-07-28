"use client"

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  type AdminNavItem,
  dockLabel,
  dockMoreGroups,
  dockPrimaryNavigation,
  isAdminRouteActive,
  isMoreRouteActive,
} from "@/components/admin-navigation"

const dockItemClassName =
  "group/nav-item relative flex min-h-11 min-w-0 items-center justify-center rounded-2xl px-1 font-medium text-[9px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.97] data-[active=true]:bg-success/10 data-[active=true]:text-success min-[360px]:text-[10px]"

const dockIconClassName =
  "grid size-7 shrink-0 -translate-y-1.5 place-items-center rounded-full transition-[color,background-color] duration-150 ease-out group-data-[active=true]/nav-item:bg-primary group-data-[active=true]/nav-item:text-white motion-reduce:transition-none"

const dockLabelClassName =
  "pointer-events-none absolute inset-x-1 bottom-1.5 truncate text-center leading-none"

export function MobileAdminNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = isMoreRouteActive(pathname)

  return (
    <nav
      aria-label="Admin navigation"
      className="fixed right-2 bottom-[var(--navbar-offset)] left-2 z-40 mx-auto h-[var(--navbar-height)] max-w-[440px] rounded-[22px] border border-white/80 bg-background p-2 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[22px] backdrop-saturate-150 sm:right-3 sm:left-3 md:hidden"
    >
      <div className="grid h-full grid-cols-5 gap-1">
        {dockPrimaryNavigation.map((item) => {
          const active = isAdminRouteActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              aria-current={active ? "page" : undefined}
              className={dockItemClassName}
              data-active={active}
            >
              <span className={dockIconClassName}>
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="size-4"
                />
              </span>
              <span aria-hidden="true" className={dockLabelClassName}>
                {dockLabel(item)}
              </span>
            </Link>
          )
        })}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger
            aria-label="More sections"
            className={dockItemClassName}
            data-active={moreActive}
          >
            <span className={dockIconClassName}>
              <HugeiconsIcon
                icon={MoreHorizontalIcon}
                strokeWidth={moreActive ? 2.2 : 1.8}
                className="size-4"
              />
            </span>
            <span aria-hidden="true" className={dockLabelClassName}>
              More
            </span>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[82dvh] gap-0 overflow-y-auto rounded-t-[28px] pb-[calc(var(--navbar-offset)+1rem)]"
            overlayClassName="bg-black/35"
          >
            <SheetHeader className="pb-4">
              <SheetTitle>All sections</SheetTitle>
              <SheetDescription>
                Jump to any part of the admin console.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-6">
              {dockMoreGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="px-1 pb-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <MoreNavTile
                        key={item.href}
                        item={item}
                        active={isAdminRouteActive(pathname, item.href)}
                        onNavigate={() => setMoreOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

function MoreNavTile({
  item,
  active,
  onNavigate,
}: {
  item: AdminNavItem
  active: boolean
  onNavigate: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className="group/tile flex min-h-14 items-center gap-3 rounded-2xl border bg-card p-3 text-left outline-none transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.98] data-[active=true]:border-primary/30 data-[active=true]:bg-primary/5"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors group-data-[active=true]/tile:bg-primary group-data-[active=true]/tile:text-white">
        <HugeiconsIcon
          icon={item.icon}
          strokeWidth={active ? 2.2 : 1.8}
          className="size-4"
        />
      </span>
      <span className="min-w-0 truncate font-medium text-[13px] text-foreground group-data-[active=true]/tile:text-primary">
        {item.name}
      </span>
    </Link>
  )
}
