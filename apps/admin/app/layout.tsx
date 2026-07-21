import "@workspace/ui/globals.css"

import type { Metadata } from "next"
import { Geist, Public_Sans } from "next/font/google"
import { cn } from "@workspace/ui/lib/utils"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "light min-h-full bg-background font-sans antialiased",
        geist.variable,
        publicSans.variable
      )}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
