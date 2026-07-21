import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/landing"

export const metadata: Metadata = {
  title: "Privacy Policy | Zimba",
  description: "Privacy Policy for Zimba construction expense tracking.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-medium text-foreground">1. Information We Collect</h2>
            <p className="mt-2">
              When you sign in with Google, we receive your name, email address,
              and profile photo as provided by Google. We also collect information
              you submit directly, such as project details, expenses, and supplier
              records.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use your information to provide and improve the Service, authenticate
              your account, communicate with you about your account, and display
              your name and photo within the app.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">3. Data Storage and Security</h2>
            <p className="mt-2">
              Your data is stored securely and transmitted over encrypted connections.
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">4. Third-Party Services</h2>
            <p className="mt-2">
              We use Google OAuth for authentication. Your use of Google services is
              governed by{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">5. Data Retention and Deletion</h2>
            <p className="mt-2">
              We retain your data for as long as your account is active. You may request
              deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground">6. Contact</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy, please contact us at{" "}
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
