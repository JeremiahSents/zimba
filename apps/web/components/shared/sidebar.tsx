"use client"

import { Menu } from "@base-ui/react/menu"
import {
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  Logout03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import {
  buildWorkspaceHref,
  dashboardNavigation,
  getWorkspaceSlug,
  isDashboardRouteActive,
} from "@/components/shared/dashboard-navigation"
import {
  formatRole,
  getInitials,
  useWorkspace,
} from "@/components/shared/workspace-context"
import { authClient } from "@/lib/auth-client"

export function DashboardSidebar() {
  const pathname = usePathname()
  const slug = getWorkspaceSlug(pathname) ?? ""

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
              {dashboardNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isDashboardRouteActive(
                      pathname,
                      slug,
                      item.segment
                    )}
                    className="relative h-10 rounded-md px-3 font-medium text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-primary"
                    render={
                      <Link href={buildWorkspaceHref(slug, item.segment)}>
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
        <UserProfileCard />
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
          width={20}
          height={20}
          style={{ width: "auto", height: "auto" }}
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
            style={{ width: "auto", height: "auto" }}
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

function UserProfileCard() {
  const { state } = useSidebar()
  const router = useRouter()
  const user = useWorkspace()
  const role = formatRole(user.role)
  const initials = getInitials(user.name)

  async function handleSignOut() {
    try {
      await authClient.signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    }
    router.push("/login")
    router.refresh()
  }

  if (state === "collapsed") {
    return (
      <Menu.Root>
        <Menu.Trigger
          aria-label={`User account menu for ${user.name}`}
          className="mx-auto grid size-10 place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-sidebar-ring cursor-pointer"
        >
          <Avatar className="size-9 border border-sidebar-border">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            align="start"
            side="right"
            sideOffset={8}
            className="isolate z-50 outline-none"
          >
            <Menu.Popup className="w-56 origin-(--transform-origin) rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0">
              <div className="border-b px-3 py-2">
                <p className="font-medium text-xs text-foreground truncate">
                  {user.name}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                  {role} · {user.organizationName}
                </p>
              </div>
              <Menu.Item
                onClick={handleSignOut}
                className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-xs text-destructive outline-none transition-colors hover:bg-destructive/10 data-highlighted:bg-destructive/10"
              >
                <HugeiconsIcon
                  icon={Logout03Icon}
                  strokeWidth={1.8}
                  className="size-4"
                />
                Sign out
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`User account menu for ${user.name}`}
        className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2.5 shadow-2xs transition-colors hover:bg-sidebar-accent/80 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Avatar className="size-9 shrink-0 border border-sidebar-border">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-sidebar-foreground text-xs leading-tight">
            {user.name}
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-sidebar-foreground/55 leading-tight">
            {role} · {user.organizationName}
          </span>
        </div>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="start"
          side="top"
          sideOffset={8}
          className="isolate z-50 outline-none"
        >
          <Menu.Popup className="w-56 origin-(--transform-origin) rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <div className="border-b px-3 py-2">
              <p className="font-medium text-xs text-foreground truncate">
                {user.name}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                {role} · {user.organizationName}
              </p>
            </div>
            <Menu.Item
              onClick={handleSignOut}
              className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-xs text-destructive outline-none transition-colors hover:bg-destructive/10 data-highlighted:bg-destructive/10"
            >
              <HugeiconsIcon
                icon={Logout03Icon}
                strokeWidth={1.8}
                className="size-4"
              />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
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
