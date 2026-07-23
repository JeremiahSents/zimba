import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type StatusType =
  | "active"
  | "inactive"
  | "trial"
  | "suspended"
  | "pending"
  | "resolved"
  | "failed"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()

  const variantMap: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    trial: "secondary",
    suspended: "destructive",
    inactive: "outline",
    pending: "secondary",
    resolved: "default",
    failed: "destructive",
  }

  const customColors: Record<string, string> = {
    active:
      "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border-emerald-500/20",
    trial:
      "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-blue-500/20",
    suspended:
      "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-red-500/20",
    failed:
      "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-red-500/20",
    pending:
      "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border-amber-500/20",
    resolved:
      "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border-emerald-500/20",
  }

  const baseVariant = variantMap[normalizedStatus] || "outline"
  const customColor = customColors[normalizedStatus]

  return (
    <Badge
      variant={customColor ? "outline" : baseVariant}
      className={cn("capitalize font-medium", customColor, className)}
    >
      {status}
    </Badge>
  )
}
