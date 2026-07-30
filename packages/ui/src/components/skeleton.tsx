"use client"

import { Skeleton as BoneyardSkeleton } from "boneyard-js/react"
import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
      {...props}
    />
  )
}

function AppSkeleton({
  name,
  loading = true,
  children,
  fixture,
  className,
}: {
  name: string
  loading?: boolean
  children: ReactNode
  fixture?: ReactNode
  className?: string
}) {
  return (
    <BoneyardSkeleton
      name={name}
      loading={loading}
      fixture={fixture}
      color="rgba(0, 0, 0, 0.06)"
      darkColor="rgba(255, 255, 255, 0.06)"
      animate="shimmer"
      className={cn("block", className)}
      fallback={children}
    >
      {children}
    </BoneyardSkeleton>
  )
}

export { AppSkeleton, Skeleton }
