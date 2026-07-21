import { PageHeader } from "../../components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

export default function SystemPage() {
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
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">Database (PostgreSQL)</span>
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Operational</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Operational</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">File Upload (UploadThing)</span>
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Operational</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Background Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">Receipt Processing</span>
              <Badge variant="default" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20">Delayed</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">Email Delivery</span>
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Operational</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium">Data Exports</span>
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Operational</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-sm text-muted-foreground">App Version</span>
              <span className="font-medium">v0.1.0-alpha</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-sm text-muted-foreground">Error Rate (24h)</span>
              <span className="font-medium">0.12%</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-medium">99.98%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
