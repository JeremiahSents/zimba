import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" className={cn("text-xs", className)} {...props} />
}
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("flex flex-wrap items-center gap-1.5 text-muted-foreground", className)} {...props} />
}
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}
function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return <a className={cn("font-semibold text-primary hover:text-primary/75", className)} {...props} />
}
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-current="page" className={cn("font-medium text-foreground", className)} {...props} />
}
function BreadcrumbSeparator() { return <span aria-hidden="true">/</span> }

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator }
