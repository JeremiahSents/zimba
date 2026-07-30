import "@workspace/ui/globals.css"
// Side-effect import: registers the bones captured by `pnpm bones:admin` so
// every <BoneSkeleton name="..."> can resolve them. Required — without it the
// loading routes fall back to their static placeholders.
import "../bones/registry"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import type { Metadata } from "next"
import { Geist, Public_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeShortcut } from "@/components/theme-shortcut"

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Zimba Admin",
  description: "Internal operations dashboard for Zimba.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "min-h-full font-sans antialiased",
        geist.variable,
        publicSans.variable
      )}
    >
      <body className="min-h-dvh bg-background" suppressHydrationWarning>
        <ThemeProvider>
          <ThemeShortcut />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
