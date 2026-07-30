import { FieldDescription } from "@workspace/ui/components/field"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

/**
 * The logo, title and blurb every auth screen opens with. Shared so sign-in,
 * sign-up, password reset and email confirmation stay visually identical.
 */
export function AuthHeader({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Link href="/" className="flex flex-col items-center gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-md">
          <Image
            src="/logo-landing.png"
            alt="Zimba logo"
            width={28}
            height={28}
            className="size-7"
          />
        </div>
        <span className="sr-only">Zimba</span>
      </Link>
      <h1 className="font-bold text-xl">{title}</h1>
      <FieldDescription>{description}</FieldDescription>
    </div>
  )
}
