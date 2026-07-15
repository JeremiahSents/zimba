"use client"

import {
  BellIcon,
  Building01Icon,
  Logout03Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  isDashboardRouteActive,
  isMobileMoreRoute,
  mobileMoreNavigation,
  mobilePrimaryNavigation,
} from "@/components/shared/dashboard-navigation"
import {
  formatRole,
  useWorkspace,
} from "@/components/shared/workspace-provider"
import { authClient } from "@/lib/auth-client"

export function MobileDashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useWorkspace()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = isMobileMoreRoute(pathname)

  async function handleSignOut() {
    setMoreOpen(false)
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <nav
        aria-label="Dashboard navigation"
        className="fixed right-2 bottom-navbar-offset left-2 z-40 mx-auto h-navbar-height max-w-[440px] rounded-[22px] border border-white/75 bg-background/82 p-1.5 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[18px] backdrop-saturate-150 supports-[not_(backdrop-filter:blur(1px))]:bg-background sm:right-3 sm:left-3 md:hidden"
      >
        <div className="grid h-full grid-cols-6 gap-0.5">
          {mobilePrimaryNavigation.map((item) => {
            const active = isDashboardRouteActive(pathname, item.href)
            return (
              <Link
                key={item.title}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group/nav-item flex min-w-0 flex-col items-center justify-center gap-1 rounded-[16px] px-0.5 font-medium text-[9px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.97] data-[active=true]:bg-primary/11 data-[active=true]:text-primary min-[360px]:text-[10px]"
                data-active={active}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="size-[18px]"
                />
                <span className="max-w-full truncate">{item.title}</span>
              </Link>
            )
          })}
          <button
            type="button"
            aria-label="Open more dashboard destinations"
            aria-current={moreActive ? "page" : undefined}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
            className="group/nav-item flex min-w-0 flex-col items-center justify-center gap-1 rounded-[16px] px-0.5 font-medium text-[9px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/45 active:scale-[0.97] data-[active=true]:bg-primary/11 data-[active=true]:text-primary min-[360px]:text-[10px]"
            data-active={moreActive}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              strokeWidth={moreActive ? 2.2 : 1.8}
              className="size-[18px]"
            />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          overlayClassName="bg-black/25 backdrop-blur-[2px]"
          className="max-h-[85svh] overflow-y-auto rounded-t-[28px] border-t bg-background/96 px-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-24px_70px_-28px_rgba(15,23,42,0.48)] backdrop-blur-xl"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-foreground/12" />
          <SheetHeader className="px-5 pt-4 pb-4 text-left">
            <SheetTitle className="font-heading font-semibold text-lg">
              More
            </SheetTitle>
            <SheetDescription>
              Reports, finance, settings, and account actions.
            </SheetDescription>
          </SheetHeader>

          <div className="mx-4 overflow-hidden rounded-2xl border bg-card">
            {mobileMoreNavigation.map((item) => {
              const active = isDashboardRouteActive(pathname, item.href)
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-12 items-center gap-3 border-b px-4 text-sm outline-none transition-colors last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted data-[active=true]:bg-primary/8 data-[active=true]:text-primary"
                  data-active={active}
                >
                  <span
                    className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground data-[active=true]:bg-primary/12 data-[active=true]:text-primary"
                    data-active={active}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.9} />
                  </span>
                  <span className="font-medium">{item.title}</span>
                  {active ? (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 font-semibold text-[10px] text-primary">
                      Current
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>

          <div className="mx-4 mt-4 overflow-hidden rounded-2xl border bg-card">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false)
                window.dispatchEvent(new Event("zimba:open-notifications"))
              }}
              className="flex min-h-12 w-full items-center gap-3 border-b px-4 text-left text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                <HugeiconsIcon icon={BellIcon} strokeWidth={1.9} />
              </span>
              <span className="font-medium">Notifications</span>
            </button>
            <div className="flex min-h-16 items-center gap-3 px-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <HugeiconsIcon icon={Building01Icon} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-sm">
                  {user.organizationName}
                </span>
                <span className="block text-muted-foreground text-xs">
                  {user.name} · {formatRole(user.role)}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.9} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
