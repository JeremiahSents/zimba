"use client"

import { usePathname } from "next/navigation"
import { getWorkspaceSlug } from "@/components/shared/dashboard-navigation"

export function useWorkspaceSlug(): string {
  const pathname = usePathname()
  return getWorkspaceSlug(pathname) ?? ""
}

export function useWorkspaceHref(segment: string): string {
  const slug = useWorkspaceSlug()
  return `/${slug}/${segment}`
}
