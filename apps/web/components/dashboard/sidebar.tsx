import Link from "next/link"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { roles } from "@/components/dashboard/data"

const navItems = ["Dashboard", "Expenses", "Suppliers", "Team", "Reports"]

export function DashboardSidebar() {
  return (
    <aside className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-9 place-items-center rounded-lg bg-sidebar-foreground font-heading text-base font-bold text-sidebar">
          Z
        </span>
        <span className="font-heading text-lg font-semibold">Zimba</span>
      </Link>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item}
            href={item === "Dashboard" ? "/dashboard" : "#"}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            data-active={item === "Dashboard"}
          >
            <span className="size-2 rounded-full bg-sidebar-primary/45 data-[active=true]:bg-sidebar-primary" data-active={item === "Dashboard"} />
            {item}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/45">
            Preview as
          </p>
          <Tabs defaultValue={roles[0]} orientation="vertical">
            <TabsList className="w-full bg-sidebar-accent text-sidebar-foreground/75">
              {roles.map((role) => (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="w-full justify-start data-active:bg-sidebar-foreground data-active:text-sidebar"
                >
                  {role}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border p-2">
          <Avatar>
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
              MB
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Musa Byaruhanga</p>
            <p className="text-xs text-sidebar-foreground/55">Owner / Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
