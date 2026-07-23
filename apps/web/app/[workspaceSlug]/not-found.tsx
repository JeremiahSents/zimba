import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-semibold text-2xl">Workspace not found</h1>
      <p className="max-w-md text-muted-foreground">
        The workspace you are looking for does not exist or you do not have
        access to it.
      </p>
      <Link href="/login" className={buttonVariants({ variant: "outline" })}>
        Back to login
      </Link>
    </div>
  )
}
