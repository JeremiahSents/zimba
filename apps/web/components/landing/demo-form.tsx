"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import { useActionState, useEffect, useRef } from "react"

import {
  type DemoRequestState,
  requestDemo,
} from "@/core/organizations/demo-request"

const initialState: DemoRequestState = { status: "idle" }

export function DemoForm() {
  const [state, formAction, isPending] = useActionState(
    requestDemo,
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)
  // Only react to a given result once, so re-renders cannot re-fire the toast.
  const handledState = useRef<DemoRequestState | null>(null)

  useEffect(() => {
    if (state === handledState.current) return
    handledState.current = state

    if (state.status === "success") {
      toast.success("Request sent — check your inbox", {
        description:
          "We've emailed you a confirmation. Our team reviews every request and will be in touch within one working day.",
      })
      formRef.current?.reset()
      return
    }

    if (state.status === "error" && state.error) toast.error(state.error)
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-primary/20 bg-background p-6 shadow-sm sm:p-7"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="demo-full-name">Full name</Label>
          <Input
            id="demo-full-name"
            name="fullName"
            autoComplete="name"
            placeholder="Your name"
            className="rounded-md"
            defaultValue={state.values?.fullName}
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
            required
          />
          {state.fieldErrors?.fullName ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.fullName}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="demo-company-name">Company name</Label>
          <Input
            id="demo-company-name"
            name="companyName"
            autoComplete="organization"
            placeholder="Your company"
            className="rounded-md"
            defaultValue={state.values?.companyName}
            aria-invalid={Boolean(state.fieldErrors?.companyName)}
            required
          />
          {state.fieldErrors?.companyName ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.companyName}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="demo-email">Email</Label>
          <Input
            id="demo-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="rounded-md"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            required
          />
          {state.fieldErrors?.email ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="mt-1 w-full rounded-md"
        >
          {isPending ? "Sending request…" : "Book a Demo"}
        </Button>

        <p className="text-center text-muted-foreground text-xs leading-5">
          We&apos;ll only use these details to set up your demo.
        </p>
      </div>
    </form>
  )
}
