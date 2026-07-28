import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

/**
 * Soft, ring-bordered pill for row status. Unlike `Badge` (which leans on the
 * primary/secondary surface colours), every tone here pairs a `*-soft`
 * background with its solid counterpart as the text colour, so the pill reads
 * as a tint of the semantic colour rather than a filled chip.
 */
const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-medium text-xs leading-none ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground ring-border",
        success: "bg-success-soft text-success ring-success/30",
        warning: "bg-warning-soft text-warning ring-warning/30",
        info: "bg-info-soft text-info ring-info/30",
        danger: "bg-destructive-soft text-destructive ring-destructive/30",
      },
      dot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      tone: "neutral",
      dot: false,
    },
  }
)

type StatusBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants>

function StatusBadge({
  className,
  tone,
  dot,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-tone={tone ?? "neutral"}
      className={cn(statusBadgeVariants({ tone, dot }), className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  )
}

export type { StatusBadgeProps }
export { StatusBadge, statusBadgeVariants }
