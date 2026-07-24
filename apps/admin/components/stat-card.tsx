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

const accentStyles = {
  default: {
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-red-600 dark:text-red-400",
  },
  emerald: {
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-red-600 dark:text-red-400",
  },
  amber: {
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-red-600 dark:text-red-400",
  },
  rose: {
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-red-600 dark:text-red-400",
  },
  blue: {
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-red-600 dark:text-red-400",
  },
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  accent = "default",
}: StatCardProps) {
  const styles = accentStyles[accent]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-muted-foreground text-xs">
            {title}
          </p>
          <p className="mt-2 font-heading font-semibold text-2xl tracking-tight tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className="flex shrink-0 items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
      {(description || trend) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend && (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  trend.isPositive ? styles.trendPositive : styles.trendNegative
                )}
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className={cn(
                    "size-3",
                    !trend.isPositive && "rotate-180"
                  )}
                >
                  <path
                    d="M6 2.5V9.5M6 2.5L3 5.5M6 2.5L9 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </>
          )}
          {!trend && description && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  )
}
