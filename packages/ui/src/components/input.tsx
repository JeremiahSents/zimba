import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@workspace/ui/lib/utils"
import type * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[10px] border border-input bg-card px-4 py-2 text-sm outline-none transition-[border-color,background-color] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-normal file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
