import { Skeleton } from "@workspace/ui/components/skeleton"

export default function SettingsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading settings" className="p-6">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  )
}
