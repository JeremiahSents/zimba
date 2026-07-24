import { getOnboardingApplicationDetailUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ApplicationActions } from "@/components/application-actions"
import { PageHeader } from "@/components/page-header"
import { requirePlatformSession } from "@/core/auth/service"

export const metadata: Metadata = {
  title: "Application Review | Zimba Admin",
}

export const dynamic = "force-dynamic"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePlatformSession()
  const { id } = await params

  const application = await getOnboardingApplicationDetailUseCase(
    apiExecutor,
    id
  )
  if (!application) notFound()

  const isPending = application.status === "pending"

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Application Review"
        description={`${application.companyName} — ${application.fullName}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">
                Company name
              </span>
              <span className="font-medium text-sm">
                {application.companyName}
              </span>
            </div>
            {application.companyWebsite && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-sm">Website</span>
                <a
                  href={application.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary text-sm hover:underline"
                >
                  {application.companyWebsite}
                </a>
              </div>
            )}
            {application.industry && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-sm">Industry</span>
                <span className="font-medium text-sm">
                  {application.industry}
                </span>
              </div>
            )}
            {application.country && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-sm">Country</span>
                <span className="font-medium text-sm">
                  {application.country}
                </span>
              </div>
            )}
            {application.teamSize && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-sm">Team size</span>
                <span className="font-medium text-sm">
                  {application.teamSize}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Use Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Full name</span>
              <span className="font-medium text-sm">
                {application.fullName}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="font-medium text-sm">{application.email}</span>
            </div>
            {application.phone && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-sm">Phone</span>
                <span className="font-medium text-sm">{application.phone}</span>
              </div>
            )}
            {application.useCase && (
              <div className="border-b pb-2">
                <span className="text-muted-foreground text-sm">
                  How will they use Zimba?
                </span>
                <p className="mt-1 text-sm">{application.useCase}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              Current status:
            </span>
            <Badge
              variant={
                application.status === "pending"
                  ? "secondary"
                  : application.status === "approved"
                    ? "success"
                    : "destructive"
              }
            >
              {application.status}
            </Badge>
          </div>

          {application.reviewedAt && (
            <div className="text-muted-foreground text-sm">
              Reviewed on {new Date(application.reviewedAt).toLocaleString()}
            </div>
          )}

          {application.rejectionReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="font-medium text-destructive text-sm">
                Rejection reason
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                {application.rejectionReason}
              </p>
            </div>
          )}

          {isPending && <ApplicationActions applicationId={application.id} />}
        </CardContent>
      </Card>
    </div>
  )
}
