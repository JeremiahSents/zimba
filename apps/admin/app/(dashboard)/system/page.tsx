import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { getSystemHealth, getSystemMetrics } from "@/core/system/service"

export default async function SystemPage() {
  const [healthChecks, metrics] = await Promise.all([
    getSystemHealth(),
    getSystemMetrics(),
  ])

  const coreServices = healthChecks.filter((h) =>
    [
      "Database (PostgreSQL)",
      "Authentication",
      "File Upload (UploadThing)",
    ].includes(h.label)
  )
  const backgroundJobs = healthChecks.filter((h) =>
    ["Background Jobs", "Email Delivery"].includes(h.label)
  )

  const statusBadgeClass = (status: string) => {
    if (status === "operational")
      return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20"
    if (status === "degraded")
      return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20"
    return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20"
  }

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="System Health"
        description="Monitor platform infrastructure and operational metrics."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Core Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreServices.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b pb-2"
              >
                <span className="font-medium text-sm">{item.label}</span>
                <Badge
                  variant="default"
                  className={statusBadgeClass(item.status)}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Background Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {backgroundJobs.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b pb-2"
              >
                <span className="font-medium text-sm">{item.label}</span>
                <Badge
                  variant="default"
                  className={statusBadgeClass(item.status)}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground text-sm">App Version</span>
              <span className="font-medium">v{metrics.appVersion}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground text-sm">Environment</span>
              <span className="font-medium capitalize">{metrics.nodeEnv}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground text-sm">
                Last Checked
              </span>
              <span className="font-medium">
                {new Date(metrics.timestamp).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
