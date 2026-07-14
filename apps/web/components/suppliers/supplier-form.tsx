"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import type { NewSupplierValues } from "@/lib/supplier-store"

const initialValues: NewSupplierValues = {
  name: "",
  category: "materials",
  companyContact: "",
  contactName: "",
  phone: "",
  email: "",
  notes: "",
}

export function SupplierForm({
  onSubmit,
  onCancel,
  compact = false,
}: {
  onSubmit: (values: NewSupplierValues) => void
  onCancel?: () => void
  compact?: boolean
}) {
  const [values, setValues] = useState(initialValues)
  const update = (key: keyof NewSupplierValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (
          !values.name.trim() ||
          !values.contactName.trim() ||
          !values.phone.trim() ||
          !values.email.trim()
        )
          return
        onSubmit({
          ...values,
          name: values.name.trim(),
          contactName: values.contactName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
        })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 sm:col-span-2">
          <Label>Company name</Label>
          <Input
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Prime Cement"
          />
        </label>
        <label className="grid gap-2">
          <Label>Category</Label>
          <Select
            value={values.category}
            onValueChange={(value) => update("category", value ?? "materials")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="labour">Labour</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2">
          <Label>Company contact</Label>
          <Input
            required
            value={values.companyContact}
            onChange={(event) => update("companyContact", event.target.value)}
            placeholder="Company phone or office"
          />
        </label>
        <label className="grid gap-2">
          <Label>Person of contact</Label>
          <Input
            required
            value={values.contactName}
            onChange={(event) => update("contactName", event.target.value)}
            placeholder="Full name"
          />
        </label>
        <label className="grid gap-2">
          <Label>Phone</Label>
          <Input
            required
            type="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+256 ..."
          />
        </label>
        <label className="grid gap-2">
          <Label>Email</Label>
          <Input
            required
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="name@company.com"
          />
        </label>
        {!compact && (
          <label className="grid gap-2 sm:col-span-2">
            <Label>
              Notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <textarea
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Anything the team should know about this supplier"
              className="min-h-24 rounded-[10px] border border-input bg-card px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/25"
            />
          </label>
        )}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save supplier</Button>
      </div>
    </form>
  )
}
