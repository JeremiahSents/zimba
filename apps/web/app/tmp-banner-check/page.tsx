// TEMPORARY layout harness — delete after verifying the grant exit control.
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { DashboardSidebar } from "@/components/shared/sidebar"
import { WorkspaceProvider } from "@/components/shared/workspace-provider"

export default function TmpBannerCheck() {
  return (
    <WorkspaceProvider
      user={{
        image: null,
        name: "Sentomero Jeremiah",
        organizationName: "HMK Real Estate and Construction",
        role: "owner",
        viaGrant: true,
      }}
    >
      <SidebarProvider className="min-h-svh w-full bg-transparent">
        <DashboardSidebar />
        <div className="p-6">
          <h1 className="font-bold text-2xl">Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Main content stands in for the workspace home page.
          </p>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
