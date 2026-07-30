"use client"

import { Menu } from "@base-ui/react/menu"
import {
  Add01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { toast } from "@workspace/ui/components/sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { type FormEvent, useState, useTransition } from "react"
import {
  formatRole,
  useWorkspaceList,
  type WorkspaceSummary,
} from "@/components/shared/workspace-context"
import { createWorkspaceAction } from "@/core/organizations/workspace-actions"

/**
 * Replaces the static brand link. The workspace name is the switcher, which is
 * the convention people arrive with from Linear, Vercel and Notion — a separate
 * "switch workspace" control would be a second thing to find.
 */
export function WorkspaceSwitcher() {
  const { state } = useSidebar()
  const { workspaces, currentSlug, canCreateWorkspace } = useWorkspaceList()
  const [createOpen, setCreateOpen] = useState(false)

  const current =
    workspaces.find((workspace) => workspace.slug === currentSlug) ?? null
  const label = current?.organizationName ?? "Workspace"
  const collapsed = state === "collapsed"

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          aria-label={`Switch workspace. Current workspace ${label}`}
          className={
            collapsed
              ? "group mx-auto grid size-10 cursor-pointer place-items-center rounded-lg outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              : "group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          }
        >
          <BrandMark />
          {collapsed ? null : (
            <>
              <span
                title={label}
                className="min-w-0 flex-1 truncate font-heading font-medium text-[17px] text-sidebar-foreground tracking-tight"
              >
                {label}
              </span>
              {/* Up-and-down pair rather than a single chevron: this swaps
                  between peers, it does not expand a section. */}
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="size-4 shrink-0 text-sidebar-foreground/50 transition-colors group-hover:text-sidebar-foreground/80"
              />
            </>
          )}
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            align="start"
            side={collapsed ? "right" : "bottom"}
            sideOffset={6}
            className="isolate z-50 outline-none"
          >
            <Menu.Popup className="max-h-[min(28rem,var(--available-height))] w-64 origin-(--transform-origin) overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0">
              <p className="px-2.5 pt-1.5 pb-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                Workspaces
              </p>
              {workspaces.map((workspace) => (
                <WorkspaceOption
                  key={workspace.organizationId}
                  workspace={workspace}
                  isCurrent={workspace.slug === currentSlug}
                />
              ))}

              {canCreateWorkspace ? (
                <>
                  <div className="my-1 h-px bg-border" />
                  <Menu.Item
                    onClick={() => setCreateOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-xs outline-none transition-colors hover:bg-accent data-highlighted:bg-accent"
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    New workspace
                  </Menu.Item>
                </>
              ) : null}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function WorkspaceOption({
  workspace,
  isCurrent,
}: {
  workspace: WorkspaceSummary
  isCurrent: boolean
}) {
  const router = useRouter()

  return (
    <Menu.Item
      // Switching lands on Home rather than the equivalent route in the other
      // workspace: ids are per-workspace, so /a/projects/123 has no counterpart
      // under /b and would 404.
      onClick={() => router.push(`/${workspace.slug}/home`)}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none transition-colors hover:bg-accent data-highlighted:bg-accent"
    >
      <WorkspaceMark name={workspace.organizationName} size="sm" />
      <span className="min-w-0 flex-1">
        <span
          title={workspace.organizationName}
          className="block truncate font-medium text-xs"
        >
          {workspace.organizationName}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
          {formatRole(workspace.role)}
        </span>
      </span>
      {workspace.viaGrant ? (
        <Badge variant="outline" className="shrink-0 px-1.5 text-[9px]">
          Grant
        </Badge>
      ) : null}
      {isCurrent ? (
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2.5}
          className="size-3.5 shrink-0 text-primary"
        />
      ) : null}
    </Menu.Item>
  )
}

/**
 * The Zimba logo, which stays put while the name beside it changes with the
 * workspace. `priority` keeps it out of the lazy-load queue so it is painted on
 * first render rather than popping in — it is the one mark that must never
 * flicker, since it anchors the whole sidebar.
 */
function BrandMark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center">
      <Image
        src="/logo-landing.png"
        alt="Zimba"
        width={24}
        height={24}
        priority
        className="size-5 object-contain"
      />
    </span>
  )
}

/** Initial-in-a-tile, so workspaces stay distinguishable in the switcher list. */
function WorkspaceMark({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md"
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "W"
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-md bg-primary/10 font-semibold text-primary ${
        size === "sm" ? "size-6 text-[10px]" : "size-7 text-xs"
      }`}
    >
      {initial}
    </span>
  )
}

function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error("Enter a workspace name of at least 2 characters.")
      return
    }

    startTransition(async () => {
      const result = await createWorkspaceAction({ name: trimmed })
      if (!result.success) {
        toast.error(result.error.message)
        return
      }
      toast.success(`${trimmed} is ready`, {
        description: "You're the owner. Invite your team from Settings.",
      })
      onOpenChange(false)
      setName("")
      router.push(`/${result.data.slug}/home`)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        onOpenChange(next)
        if (!next) setName("")
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New workspace</DialogTitle>
          <DialogDescription>
            A separate set of projects, suppliers and budgets. Nothing is shared
            with your other workspaces.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Kampala Heights Ltd"
              maxLength={120}
              autoFocus
              disabled={pending}
            />
            <p className="text-muted-foreground text-xs">
              You can rename it later. The web address is generated from this
              name.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || name.trim().length < 2}>
              {pending ? "Creating…" : "Create workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
