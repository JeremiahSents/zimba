"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      // Left off deliberately: the app has only ever been designed and reviewed
      // in light, so following the OS would flip every existing user to a theme
      // nobody has walked yet. Dark is opt-in via the shortcut until then.
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
