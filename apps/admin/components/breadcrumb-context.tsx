"use client"

import {
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react"

export type BreadcrumbEntry = {
  label: string
  href?: string
}

const BreadcrumbContext = createContext<{
  items: BreadcrumbEntry[]
  setItems: (items: BreadcrumbEntry[]) => void
}>({
  items: [],
  setItems: () => {},
})

/**
 * Stores breadcrumbs keyed by pathname. Pages that render `BreadcrumbSetter`
 * populate the entry for their route; pages that don't get an empty array,
 * so stale breadcrumbs never survive a navigation.
 */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [store, setStore] = useState<Record<string, BreadcrumbEntry[]>>({})

  const setItems = useCallback(
    (items: BreadcrumbEntry[]) => {
      setStore((prev) => ({ ...prev, [pathname]: items }))
    },
    [pathname]
  )

  const items = store[pathname] ?? []

  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbs() {
  return useContext(BreadcrumbContext)
}

/**
 * Renders nothing. Pages drop this in their tree to push breadcrumb entries
 * into the topbar. Uses `useLayoutEffect` so the topbar updates before paint
 * and avoids a flash of empty breadcrumbs on navigation.
 */
export function BreadcrumbSetter({ items }: { items: BreadcrumbEntry[] }) {
  const { setItems } = useBreadcrumbs()
  useLayoutEffect(() => {
    setItems(items)
  }, [items, setItems])
  return null
}

export function AdminBreadcrumbs() {
  const { items } = useBreadcrumbs()

  if (items.length === 0) return null

  return (
    <BreadcrumbUI className="hidden md:flex">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {isLast || !item.href ? (
                <BreadcrumbPage className="truncate text-[13px] font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link href={item.href} />}
                  className="truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </BreadcrumbUI>
  )
}
