import { Geist, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { PointerCaptureGuard } from "@/components/shared/pointer-capture-guard"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "light font-sans antialiased",
        geist.variable,
        inter.variable
      )}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Zimba" />
      </head>
      <body>
        <PointerCaptureGuard />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
