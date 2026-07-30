import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  accent?: "default" | "emerald" | "amber" | "rose" | "blue"
}

export function StatCard({
  title,
  value,
  icon,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{title}</p>
            <p className="mt-1 font-heading text-lg font-semibold leading-tight tracking-tight tabular-nums">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          {icon ? (
            <div className="flex shrink-0 items-center justify-center text-primary">
              {icon}
            </div>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
