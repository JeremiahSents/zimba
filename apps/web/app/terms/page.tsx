import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/landing"

export const metadata: Metadata = {
  title: "Terms of Service | Zimba",
  description: "Terms of Service for Zimba construction expense tracking.",
}

export default function TermsPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-medium text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By creating an account or using Zimba (&quot;the Service&quot;), you agree
              to these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">2. Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old and have the authority to bind your
              organization to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">3. Your Account</h2>
            <p className="mt-2">
              You are responsible for maintaining the security of your account and for
              all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">4. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to misuse the Service, including but not limited to
              uploading malicious content, attempting to access data you are not
              authorized to view, or interfering with the Service&apos;s operation.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">5. Intellectual Property</h2>
            <p className="mt-2">
              The Service, including its design, software, and content, is owned by
              Zimba and protected by intellectual property laws. You retain ownership
              of the data you submit.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">6. Termination</h2>
            <p className="mt-2">
              We may suspend or terminate your access to the Service at any time for
              violation of these terms. You may close your account at any time.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">7. Disclaimer</h2>
            <p className="mt-2">
              The Service is provided &quot;as is&quot; without warranties of any kind.
              We do not guarantee the Service will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">8. Contact</h2>
            <p className="mt-2">
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@zimba.app"
                className="text-primary underline underline-offset-4"
              >
                support@zimba.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-primary underline underline-offset-4"
          >
            &larr; Back to home
          </Link>
        </div>
      </article>
      <Footer />
    </main>
  )
}
