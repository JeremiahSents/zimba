import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

export function MobileDataCard({
  eyebrow,
  title,
  value,
  status,
  children,
  actions,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  value?: ReactNode
  status?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-[0_10px_30px_-26px_rgba(15,23,42,0.7)]",
        className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <div className="mb-1 font-bold text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
              {eyebrow}
            </div>
          ) : null}
          <div className="break-words font-normal text-sm leading-5">
            {title}
          </div>
          {status ? <div className="mt-2">{status}</div> : null}
        </div>
        {value ? (
          <div className="shrink-0 text-right font-heading font-semibold text-sm tabular-nums">
            {value}
          </div>
        ) : null}
        {actions}
      </div>
      {children ? <div className="border-t px-4 py-3">{children}</div> : null}
    </article>
  )
}

export function MobileDataMeta({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-foreground text-xs">{children}</dd>
    </div>
  )
}
