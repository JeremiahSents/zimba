"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import Image from "next/image"
import Link from "next/link"
import { useActionState } from "react"
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/onboarding/actions"

const initialState: OnboardingState = {}

const industries = [
  "Construction",
  "Real Estate",
  "Engineering",
  "Architecture",
  "Project Management",
  "Other",
]

const teamSizes = ["1-5", "6-20", "21-50", "51-200", "200+"]

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
              Signed in as {email}. Tell us about you and your company to get
              started.
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

          <Field>
            <FieldLabel htmlFor="company-website">Company website</FieldLabel>
            <Input
              id="company-website"
              name="companyWebsite"
              type="url"
              placeholder="https://example.com"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="industry">Industry</FieldLabel>
              <Select name="industry">
                <SelectTrigger id="industry" className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Input id="country" name="country" placeholder="Uganda" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+256 700 000 000"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="team-size">Team size</FieldLabel>
              <Select name="teamSize">
                <SelectTrigger id="team-size" className="w-full">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="use-case">How will you use Zimba?</FieldLabel>
            <Input
              id="use-case"
              name="useCase"
              placeholder="Track project expenses, manage supplier payments..."
            />
          </Field>

          {state.error ? (
            <p role="alert" className="text-center text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting application…" : "Submit application"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        Your application will be reviewed by our team. You&apos;ll receive an
        email once approved.
      </FieldDescription>
    </div>
  )
}
