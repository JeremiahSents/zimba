import {
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  /** Small directional micro-indicator, e.g. 30-day movement. */
  trend?: {
    direction: "up" | "down"
    label: string
  }
  className?: string
  accent?: "default" | "emerald" | "amber" | "rose" | "blue"
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-muted-foreground text-xs">{title}</p>
            <p className="mt-1 font-heading font-semibold text-lg tabular-nums leading-tight tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          {icon ? (
            <div className="flex shrink-0 items-center justify-center text-primary">
              {icon}
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                trend.direction === "up"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
              )}
            >
              <HugeiconsIcon
                icon={
                  trend.direction === "up" ? ArrowUp01Icon : ArrowDown01Icon
                }
                strokeWidth={2.2}
                className="size-3"
              />
              {trend.label}
            </span>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-xs">{description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
