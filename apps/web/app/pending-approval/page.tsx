import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getBookDemoHref } from "@/components/landing/urls"
import { getOnboardingApplicationForEmail } from "@/core/organizations/onboarding-application"
import { getOrganizationMembership } from "@/core/organizations/service"

export const metadata: Metadata = {
  title: "Pending Approval | Zimba",
  description: "Your workspace application is being reviewed.",
}

export const dynamic = "force-dynamic"

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const { submitted } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const membership = await getOrganizationMembership(session.user.id)
  if (membership) redirect(`/${membership.slug}/home`)

  const application = await getOnboardingApplicationForEmail(session.user.email)

  // Signed in, no workspace, and no request on file — they registered without
  // ever booking a demo, so point them at the form.
  if (!application) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Image
                  src="/logo-landing.png"
                  alt="Zimba logo"
                  width={32}
                  height={32}
                  className="size-8"
                />
              </div>
              <CardTitle className="mt-2">No workspace yet</CardTitle>
              <CardDescription>
                We have no demo request on file for {session.user.email}. Book
                one and our team will set your workspace up.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                nativeButton={false}
                render={<Link href={getBookDemoHref()} />}
                className="w-full"
              >
                Book a demo
              </Button>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/login" />}
                className="w-full"
              >
                Back to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isApproved = application.status === "approved"
  const isRejected = application.status === "rejected"
  const isPending = application.status === "pending"

  if (isApproved && application.organizationId) {
    redirect("/workspace")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Image
                src="/logo-landing.png"
                alt="Zimba logo"
                width={32}
                height={32}
                className="size-8"
              />
            </div>
            <CardTitle className="mt-2">
              {isPending && "Access Request Under Review"}
              {isRejected && "Access Request Declined"}
            </CardTitle>
            <CardDescription>
              {isPending &&
                "Thanks for booking a demo. Zimba team will review your request."}
              {isRejected &&
                "Your request was declined. You're welcome to submit a new one."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted === "1" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <p className="font-medium text-sm">Check your email</p>
                <p className="mt-1 text-sm">
                  We sent a welcome message to{" "}
                  <strong>{application.email}</strong>.The team will
                  review your details and get in touch.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground text-sm">Company</span>
              <span className="font-medium text-sm">
                {application.companyName}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground text-sm">Applicant</span>
              <span className="font-medium text-sm">
                {application.fullName}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground text-sm">Status</span>
              <Badge
                variant={
                  isPending
                    ? "secondary"
                    : isRejected
                      ? "destructive"
                      : "default"
                }
              >
                {application.status === "pending" && "Pending"}
                {application.status === "approved" && "Approved"}
                {application.status === "rejected" && "Declined"}
              </Badge>
            </div>
            {application.industry && (
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground text-sm">Industry</span>
                <span className="font-medium text-sm">
                  {application.industry}
                </span>
              </div>
            )}
            {isRejected && application.rejectionReason && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="font-medium text-destructive text-sm">Reason</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  {application.rejectionReason}
                </p>
              </div>
            )}
            {isPending && (
              <p className="text-center text-muted-foreground text-xs">
                You&apos;ll receive an email at{" "}
                <strong>{application.email}</strong> once your request is
                reviewed. This usually takes 1-2 business days.
              </p>
            )}
            {isRejected && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={getBookDemoHref()} />}
                  className="w-full"
                >
                  Book another demo
                </Button>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="w-full"
                >
                  Back to login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
