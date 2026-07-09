import { Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  // Applying Inter as heading as well since Mintlify uses only Inter
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
        "antialiased",
        "font-sans",
        inter.variable,
        "[--font-heading:var(--font-sans)]"
      )}
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
