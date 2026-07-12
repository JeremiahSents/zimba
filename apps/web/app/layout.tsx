import { IBM_Plex_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const lausanneFallback = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lausanne",
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
      className={cn("antialiased font-sans", lausanneFallback.variable)}
    >
      <body>
        <head>
          <meta name="apple-mobile-web-app-title" content="Zimba" />
        </head>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
