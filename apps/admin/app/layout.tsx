import { Inter, Public_Sans } from "next/font/google"
import type { ReactNode } from "react"

import "@workspace/ui/globals.css"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { PointerCaptureGuard } from "@/components/shared/pointer-capture-guard"

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("light font-sans antialiased", inter.variable, publicSansHeading.variable)}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Zimba Admin" />
      </head>
      <body>
        <PointerCaptureGuard />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
