"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import type { NewSupplierValues } from "@/lib/types"
import { createSupplierCategoryAction } from "@/app/admin/suppliers/actions"

const builtInCategories = [
  { name: "Materials", slug: "materials" },
  { name: "Labour", slug: "labour" },
  { name: "Equipment", slug: "equipment" },
  { name: "Services", slug: "services" },
]

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
  pending = false,
  initialCategories = [],
}: {
  onSubmit: (values: NewSupplierValues) => void | Promise<void>
  onCancel?: () => void
  compact?: boolean
  pending?: boolean
  initialCategories?: { name: string; slug: string }[]
}) {
  const [values, setValues] = useState(initialValues)
  const [categories, setCategories] = useState(initialCategories)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const [categoryPending, setCategoryPending] = useState(false)
  const update = (key: keyof NewSupplierValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!values.name.trim()) return
        void onSubmit({
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
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Prime Cement"
          />
        </label>
        <div className="grid gap-2 self-start">
          <Label>Category</Label>
          <Select
            value={values.category}
            onValueChange={(value) => update("category", value ?? "materials")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...builtInCategories, ...categories].map((category) => <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <button type="button" className="w-fit font-medium text-primary text-xs hover:underline" onClick={() => { setCategoryError(""); setCategoryOpen(true) }}>+ Create category</button>
        </div>
        <label className="grid gap-2 self-start">
          <Label>Company contact</Label>
          <Input
            value={values.companyContact}
            onChange={(event) => update("companyContact", event.target.value)}
            placeholder="Company phone or office"
          />
        </label>
        <label className="grid gap-2 self-start">
          <Label>Person of contact</Label>
          <Input
            value={values.contactName}
            onChange={(event) => update("contactName", event.target.value)}
            placeholder="Full name"
          />
        </label>
        <label className="grid gap-2 self-start">
          <Label>Phone</Label>
          <Input
            type="tel"
            inputMode="tel"
            maxLength={16}
            value={values.phone}
            onChange={(event) =>
              update(
                "phone",
                event.target.value.replace(/[^0-9+ ]/g, "").slice(0, 16)
              )
            }
            placeholder="+256 ..."
          />
        </label>
        <label className="grid gap-2 self-start">
          <Label>Email</Label>
          <Input
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
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create supplier category</DialogTitle><DialogDescription>This category will only be available inside your organization.</DialogDescription></DialogHeader>
          <div className="grid gap-2"><Label htmlFor="new-category">Category name</Label><Input id="new-category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Transport" autoFocus />{categoryError && <p className="text-destructive text-sm" role="alert">{categoryError}</p>}</div>
          <DialogFooter><Button type="button" variant="secondary" onClick={() => setCategoryOpen(false)}>Cancel</Button><Button type="button" disabled={categoryPending || !categoryName.trim()} onClick={async () => {
            setCategoryPending(true); setCategoryError("")
            const result = await createSupplierCategoryAction(categoryName)
            setCategoryPending(false)
            if (!result.success) return setCategoryError(result.error.message)
            setCategories((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)))
            update("category", result.data.slug); setCategoryName(""); setCategoryOpen(false)
          }}>{categoryPending ? "Creating…" : "Create category"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t bg-background/96 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:static sm:flex sm:flex-row sm:justify-end sm:border-t sm:bg-transparent sm:p-0 sm:pt-4 sm:shadow-none sm:backdrop-blur-none">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save supplier"}
        </Button>
      </div>
    </form>
  )
}
