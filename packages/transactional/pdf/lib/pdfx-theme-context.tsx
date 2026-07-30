// Replaces the file pdfx-cli generates. scripts/fix-pdfx-imports.mjs restores
// this version after every `pdfx-cli add`.
//
// The generated version builds a React context so a document subtree can be
// re-themed at runtime. Importing `createContext` makes the module client-only
// under React Server Components, and because `@workspace/transactional` sits in
// the web app's `transpilePackages`, Next applies those rules here — so
// `next build` fails with "You're importing a module that depends on
// createContext into a React Server Component module". Note that `next dev`
// does not: this only shows up in a production build.
//
// Marking it `"use client"` would be worse. The bundler would hand server code
// a client *reference* rather than the real component, and the PDF would not
// render at all.
//
// Zimba renders every document with one theme, so the context bought nothing.
// The export surface is unchanged, which is what lets the generated components
// go on calling `usePdfxTheme()` untouched.

import type { DependencyList, ReactNode } from "react"
import { theme as defaultTheme } from "./pdfx-theme"

type PdfxTheme = typeof defaultTheme

export interface PdfxThemeProviderProps {
  theme?: PdfxTheme
  children: ReactNode
}

/**
 * Kept so the generated components and any copied block still compile. A theme
 * passed here is ignored — reinstate the real context if per-subtree theming is
 * ever wanted, and solve the RSC problem another way.
 */
export function PdfxThemeProvider({ children }: PdfxThemeProviderProps) {
  return <>{children}</>
}

export function usePdfxTheme(): PdfxTheme {
  return defaultTheme
}

/** Present for API compatibility with the generated components. */
export function useSafeMemo<T>(factory: () => T, _deps: DependencyList): T {
  return factory()
}
