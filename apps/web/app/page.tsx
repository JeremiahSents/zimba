import type { Metadata } from "next"

import {
  BookDemo,
  Footer,
  Hero,
  Offerings,
  StructuredData,
  TrustedBy,
} from "@/components/landing"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
}

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <StructuredData />
      <Hero />
      <TrustedBy />
      <Offerings />
      <BookDemo />
      <Footer />
    </main>
  )
}
