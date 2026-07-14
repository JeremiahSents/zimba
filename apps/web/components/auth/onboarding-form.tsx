"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import Image from "next/image"
import Link from "next/link"
import { useActionState } from "react"
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/onboarding/actions"

const initialState: OnboardingState = {}

export function OnboardingForm({
  defaultName,
  email,
}: {
  defaultName: string
  email: string
}) {
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    initialState
  )

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
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
            <h1 className="font-bold text-xl">Set up your workspace</h1>
            <FieldDescription>
              Signed in as {email}. Tell us about you and your company.
            </FieldDescription>
          </div>

          <Field data-invalid={Boolean(state.fieldErrors?.fullName)}>
            <FieldLabel htmlFor="full-name">Full name</FieldLabel>
            <Input
              id="full-name"
              name="fullName"
              autoComplete="name"
              defaultValue={defaultName}
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              required
            />
            {state.fieldErrors?.fullName ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.fullName}
              </p>
            ) : null}
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.companyName)}>
            <FieldLabel htmlFor="company-name">Company name</FieldLabel>
            <Input
              id="company-name"
              name="companyName"
              autoComplete="organization"
              placeholder="Zimba Consultants"
              aria-invalid={Boolean(state.fieldErrors?.companyName)}
              required
            />
            {state.fieldErrors?.companyName ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.companyName}
              </p>
            ) : null}
          </Field>

          {state.error ? (
            <p role="alert" className="text-center text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating workspace…" : "Create workspace"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        You&apos;ll be added as the company owner.
      </FieldDescription>
    </div>
  )
}
