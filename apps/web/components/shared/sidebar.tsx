"use client"

import {
  Analytics02Icon,
  Building01Icon,
  DashboardSquare02Icon,
  FolderKanbanIcon,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  MoneyBag02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { authClient } from "@/lib/auth-client"
import {
  formatRole,
  useWorkspace,
} from "@/components/shared/workspace-provider"

const navItems = [
  { title: "Home", href: "/admin/home", icon: DashboardSquare02Icon },
  { title: "Projects", href: "/admin/projects", icon: FolderKanbanIcon },
  { title: "Suppliers", href: "/admin/suppliers", icon: MoneyBag02Icon },
  { title: "Team", href: "/admin/team", icon: UserGroupIcon },
  { title: "Analytics", href: "/admin/analytics", icon: Analytics02Icon },
  { title: "Reports", href: "/admin/reports", icon: Analytics02Icon },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 bg-transparent group-data-[collapsible=icon]:bg-transparent"
    >
      <SidebarHeader className="p-4 pb-3 group-data-[collapsible=icon]:px-0">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={
                      item.href === "/admin/home"
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    }
                    className="relative h-10 rounded-md px-3 font-medium text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-primary"
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 pt-2 group-data-[collapsible=icon]:px-0">
        <TenantCard />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarBrand() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  if (collapsed) {
    return (
      <div className="mx-auto flex size-10 items-center justify-center">
        <Image
          src="/logo-landing.png"
          alt="Zimba logo"
          width={24}
          height={24}
          className="size-5 object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 place-items-center">
          <Image
            src="/logo-landing.png"
            alt="Zimba logo"
            width={24}
            height={24}
            className="size-6"
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading font-medium text-lg text-sidebar-foreground leading-tight tracking-tight">
            Zimba
          </span>
        </span>
      </Link>
    </div>
  )
}

function TenantCard() {
  const { state } = useSidebar()
  const router = useRouter()
  const user = useWorkspace()
  const role = formatRole(user.role)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger
          aria-label={`Current account: ${user.organizationName}, ${role}`}
          className="mx-auto grid size-10 place-items-center rounded-md border border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <HugeiconsIcon
            icon={Building01Icon}
            strokeWidth={1.8}
            className="size-4"
          />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {user.organizationName} · {role}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-sidebar-border bg-sidebar-accent/45 px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <HugeiconsIcon
          icon={Building01Icon}
          strokeWidth={1.8}
          className="size-4"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-sidebar-foreground text-xs">
          {user.organizationName}
        </span>
        <span className="mt-0.5 block text-[10px] text-sidebar-foreground/55">
          {role}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-7 px-2 text-[10px]"
        onClick={handleSignOut}
      >
        Sign out
      </Button>
    </div>
  )
}

export function DashboardSidebarToggle({
  className,
  icon,
  ...props
}: ComponentProps<typeof Button> & {
  icon: "open" | "close"
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      className={className}
      {...props}
    >
      <HugeiconsIcon
        icon={icon === "open" ? LayoutAlignRightIcon : LayoutAlignLeftIcon}
        strokeWidth={2}
      />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}
