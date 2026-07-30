"use client"

import { Menu } from "@base-ui/react/menu"
import { Logout03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
import {
  isAdminRouteActive,
  mainNav,
  platformNav,
  settingsNavItem,
} from "@/components/admin-navigation"
import { authClient } from "@/lib/auth-client"

const menuButtonClassName =
  "relative h-10 rounded-md px-3 font-medium text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4! [&_svg]:text-primary data-active:[&_svg]:text-primary"

export type AdminSidebarUser = {
  name: string
  image: string | null
  platformRole: string | null
}

function formatPlatformRole(role: string | null): string {
  if (!role) return "Staff"
  return role
    .split("_")
    .map((part, index) =>
      index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join(" ")
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SuperAdminSidebar({ user }: { user: AdminSidebarUser }) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="!border-r-0 bg-transparent group-data-[collapsible=icon]:bg-transparent"
    >
      <SidebarHeader className="p-4 pb-3 group-data-[collapsible=icon]:px-0">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isAdminRouteActive(pathname, item.href)}
                    className={menuButtonClassName}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isAdminRouteActive(pathname, item.href)}
                    className={menuButtonClassName}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.name}</span>
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
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={settingsNavItem.name}
              isActive={isAdminRouteActive(pathname, settingsNavItem.href)}
              className={menuButtonClassName}
              render={
                <Link href={settingsNavItem.href}>
                  <HugeiconsIcon icon={settingsNavItem.icon} strokeWidth={2} />
                  <span>{settingsNavItem.name}</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
        <UserProfileCard user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function UserProfileCard({ user }: { user: AdminSidebarUser }) {
  const { state } = useSidebar()
  const router = useRouter()
  const role = formatPlatformRole(user.platformRole)
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

  const avatar = (
    <Avatar className="size-9 shrink-0 border border-sidebar-border">
      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
      <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  )

  const popup = (
    <Menu.Popup className="w-56 origin-(--transform-origin) rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0">
      <div className="border-b px-3 py-2">
        <p className="truncate font-medium text-foreground text-xs">
          {user.name}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {role}
        </p>
      </div>
      <Menu.Item
        onClick={handleSignOut}
        className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-destructive text-xs outline-none transition-colors hover:bg-destructive/10 data-highlighted:bg-destructive/10"
      >
        <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.8} className="size-4" />
        Sign out
      </Menu.Item>
    </Menu.Popup>
  )

  if (state === "collapsed") {
    return (
      <Menu.Root>
        <Menu.Trigger
          suppressHydrationWarning
          aria-label={`Account menu for ${user.name}`}
          className="mx-auto grid size-10 cursor-pointer place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {avatar}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            align="start"
            side="right"
            sideOffset={8}
            className="isolate z-50 outline-none"
          >
            {popup}
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        suppressHydrationWarning
        aria-label={`Account menu for ${user.name}`}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2.5 text-left shadow-2xs outline-none transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        {avatar}
        {/* min-w-0 on both the flex child and the spans so a long name
            truncates instead of forcing the card wider than the sidebar. */}
        <div className="min-w-0 flex-1">
          <span
            title={user.name}
            className="block truncate font-medium text-sidebar-foreground text-xs leading-tight"
          >
            {user.name}
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-sidebar-foreground/55 leading-tight">
            {role}
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
          {popup}
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
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
      <Link href="/overview" className="flex min-w-0 items-center gap-3">
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
            Zimba Admin
          </span>
        </span>
      </Link>
    </div>
  )
}
