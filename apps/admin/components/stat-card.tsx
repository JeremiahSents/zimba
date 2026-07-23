import { Card } from "@workspace/ui/components/card"
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
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-muted-foreground text-xs">{title}</p>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        <p className="mt-2 break-words font-heading font-semibold text-lg tracking-tight sm:text-xl">
          {value}
        </p>
        {(description || trend) && (
          <p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
            {trend && <span>{trend.label}</span>}
            {!trend && description && <span>{description}</span>}
          </p>
        )}
      </div>
    </Card>
  )
}
