import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import type { Metadata } from "next"
import { Geist, Public_Sans } from "next/font/google"

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
      className={cn(
        "light min-h-full font-sans antialiased",
        geist.variable,
        publicSans.variable
      )}
    >
      <body className="min-h-dvh bg-background">{children}</body>
    </html>
  )
}
