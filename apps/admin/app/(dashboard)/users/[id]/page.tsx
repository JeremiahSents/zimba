import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import {
  PlatformRoleSelect,
  RemovePlatformAccessButton,
} from "@/components/platform-role-select"
import { getPlatformUserDetail } from "@/core/users/service"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const u = await getPlatformUserDetail(id)

  if (!u) {
    notFound()
  }

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title={u.name}
        description={`User details and access information.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email</span>
              <span>
                {u.email} {u.emailVerified && "✓"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Platform Role</span>
              <PlatformRoleSelect userId={u.id} currentRole={u.platformRole ?? "none"} />
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="pt-2">
              <RemovePlatformAccessButton userId={u.id} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {u.memberships.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Not a member of any organization.
              </p>
            ) : (
              <div className="space-y-4">
                {u.memberships.map((mem) => (
                  <div
                    key={mem.organizationId}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <span className="font-medium">
                      {mem.organizationName}
                    </span>
                    <Badge variant="secondary">{mem.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
