import { IBM_Plex_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeProvider } from "@/components/shared/theme-provider"

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
      className={cn("font-sans antialiased", lausanneFallback.variable)}
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
