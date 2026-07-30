import { BoneSkeleton } from "@workspace/ui/components/bones"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function SettingsLoading() {
  return (
    <BoneSkeleton name="web-settings" label="Loading settings">
      {/* Mirrors the content container in DashboardShell. */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </BoneSkeleton>
  )
}
