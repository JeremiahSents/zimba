"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Skeleton as Bones } from "boneyard-js/react"
import type { ReactNode } from "react"

/**
 * Boneyard integration. Two halves of the same contract, joined by `name`:
 *
 *   <BoneCapture name="admin-users">   in page.tsx    — the real layout
 *   <BoneSkeleton name="admin-users">  in loading.tsx — the bones replayed
 *
 * `pnpm bones:web` / `pnpm bones:admin` drives a headless browser over the
 * routes listed in each app's boneyard.config.json, measures whatever sits
 * inside a BoneCapture, and writes apps/<app>/bones/<name>.bones.json. The
 * registry import in each root layout loads those files at runtime.
 *
 * Until bones exist for a name, BoneSkeleton renders its children — so every
 * loading route keeps a hand-written placeholder as the floor.
 */

const BONE_COLOR = "rgba(0, 0, 0, 0.06)"
const BONE_DARK_COLOR = "rgba(255, 255, 255, 0.06)"

/**
 * Marks real content for capture. At runtime this renders children as-is; only
 * the CLI's headless browser reads the marker it leaves behind.
 *
 * Wrap the outermost element the matching loading.tsx replaces, so the captured
 * container and the container bones replay into are the same width.
 */
function BoneCapture({
  name,
  children,
  className,
}: {
  name: string
  children: ReactNode
  className?: string
}) {
  return (
    <Bones name={name} loading={false} className={cn("block", className)}>
      {children}
    </Bones>
  )
}

/**
 * Route-level loading state. Replays the bones captured from the BoneCapture of
 * the same `name`, falling back to `children` when that name has no bones yet.
 *
 * `select="viewport"` because bones are keyed by the viewport width the CLI
 * captured at, while these skeletons render inside a sidebar shell whose
 * container is narrower — matching on container width would pick the wrong
 * breakpoint.
 */
function BoneSkeleton({
  name,
  label,
  children,
  className,
}: {
  name: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <Bones
        name={name}
        loading
        select="viewport"
        color={BONE_COLOR}
        darkColor={BONE_DARK_COLOR}
        animate="shimmer"
        className={cn("block", className)}
        fallback={children}
      >
        {children}
      </Bones>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export { BoneCapture, BoneSkeleton }
