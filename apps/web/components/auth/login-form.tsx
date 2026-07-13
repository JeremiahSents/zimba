import Image from "next/image"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Google } from "@/components/svgs/google"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action="/dashboard">
        <FieldGroup>
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
            <h1 className="text-xl font-bold">Welcome to Zimba</h1>
            <FieldDescription>
              Sign in to preview your construction expense dashboard.
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="musa@zimba.co"
              required
            />
          </Field>

          <Field>
            <Button type="submit">Sign in</Button>
          </Field>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px bg-border" />
            <span>Or continue with</span>
            <span className="h-px bg-border" />
          </div>

          <Button variant="outline" type="button" size="lg" className="h-11 w-full">
            <Google />
            Continue with Google
          </Button>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        Authentication is mocked for now. Submitting this form opens the
        dashboard preview.
      </FieldDescription>
    </div>
  )
}
