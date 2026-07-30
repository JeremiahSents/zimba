"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useActionState } from "react"
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/onboarding/actions"
import { AuthHeader } from "./auth-header"
import { OnboardingOptionalFields } from "./onboarding-optional-fields"

const initialState: OnboardingState = {}

/**
 * Requesting a demo, not creating a workspace: submitting sends the details to
 * the super admins and nothing is provisioned until one of them approves.
 */
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
          <AuthHeader
            title="Book your Zimba demo"
            description="Tell us who you are and we'll be in touch. A Zimba super admin reviews every request before a workspace is created."
          />

          <Field data-invalid={Boolean(state.fieldErrors?.fullName)}>
            <FieldLabel htmlFor="full-name">Full name</FieldLabel>
            <Input
              id="full-name"
              name="fullName"
              autoComplete="name"
              defaultValue={state.values?.fullName ?? defaultName}
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
              defaultValue={state.values?.companyName ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.companyName)}
              required
            />
            {state.fieldErrors?.companyName ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.companyName}
              </p>
            ) : null}
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.email)}>
            <FieldLabel htmlFor="personal-email">Personal email</FieldLabel>
            <Input
              id="personal-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={state.values?.email ?? email}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              required
            />
            <FieldDescription>
              Where we&apos;ll send your demo details. Change it if you&apos;d
              rather we used a different address than {email}.
            </FieldDescription>
            {state.fieldErrors?.email ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.email}
              </p>
            ) : null}
          </Field>

          <OnboardingOptionalFields />

          {state.error ? (
            <p role="alert" className="text-center text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending request…" : "Book Demo"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        We&apos;ll email you a confirmation right away, and again once a super
        admin has reviewed your request.
      </FieldDescription>
    </div>
  )
}
