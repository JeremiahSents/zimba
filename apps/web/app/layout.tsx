import { Geist, Inter, Roboto, Public_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

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
            , "font-sans", roboto.variable, publicSansHeading.variable)}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Zimba" />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
