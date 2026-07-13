"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { useState } from "react"

export function ProjectCreateSheet({
  onCreated,
}: {
  onCreated: (project: {
    name: string
    location: string
    budget: number
  }) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name || !location || !budget) return
    onCreated({ name, location, budget: Number(budget) })
    setName("")
    setLocation("")
    setBudget("")
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        + New project
      </Button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a project</SheetTitle>
          <SheetDescription>Set up a new construction budget.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="grid gap-4 px-6">
          <Field
            label="Project name"
            value={name}
            onChange={setName}
            placeholder="Kironde Road Apartments"
          />
          <Field
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Kololo, Kampala"
          />
          <Field
            label="Total budget (UGX)"
            value={budget}
            onChange={setBudget}
            placeholder="45000000"
            type="number"
          />
          <SheetFooter className="px-0">
            <Button type="submit">Create project</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="grid gap-2">
      <Label>{label}</Label>
      <Input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
