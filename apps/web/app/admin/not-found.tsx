import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function AdminNotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="font-medium text-primary text-sm">404</p>
        <h1 className="mt-3 font-heading font-semibold text-2xl">
          This record could not be found
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          It may have been removed, or it may belong to another workspace.
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/admin/home" />}
        >
          Back to dashboard
        </Button>
      </div>
    </main>
  )
}
