import { Geist, Inter, Public_Sans, Roboto } from "next/font/google"

import "@workspace/ui/globals.css"
// Side-effect import: registers the bones captured by `pnpm bones:web` so every
// <BoneSkeleton name="..."> can resolve them. Required — without it the loading
// routes fall back to their static placeholders.
import "../bones/registry"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

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
        inter.variable,
        "font-sans",
        roboto.variable,
        publicSansHeading.variable
      )}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Zimba" />
      </head>
      <body suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
