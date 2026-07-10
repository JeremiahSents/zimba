"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const progressVariants = cva("h-full rounded-full transition-all", {
  variants: {
    tone: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
    },
  },
  defaultVariants: { tone: "primary" },
})

function Progress({
  className,
  children,
  value,
  tone,
  ...props
}: ProgressPrimitive.Root.Props & VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator tone={tone} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-2.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  tone,
  ...props
}: ProgressPrimitive.Indicator.Props & VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(progressVariants({ tone }), className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
