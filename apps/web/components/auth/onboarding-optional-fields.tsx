"use client"

import {
  Field,
  FieldDescription,
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

const industries = [
  "Construction",
  "Real Estate",
  "Engineering",
  "Architecture",
  "Project Management",
  "Other",
]

const teamSizes = ["1-5", "6-20", "21-50", "51-200", "200+"]

/**
 * Context a super admin finds useful when deciding on a demo request, none of
 * it required. The three fields the request itself needs live in the parent
 * form so they read as the ones that matter.
 */
export function OnboardingOptionalFields() {
  return (
    <>
      <FieldDescription className="border-t pt-4">
        Optional — helps us tailor the demo.
      </FieldDescription>

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
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
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
          placeholder="Track project expenses, manage supplier payments…"
        />
      </Field>
    </>
  )
}
