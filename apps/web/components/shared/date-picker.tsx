"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"

import { Calendar } from "@/components/shared/calendar"

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDate(value)

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2 font-normal"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          strokeWidth={1.8}
          className="size-4 text-muted-foreground"
        />
        {selected.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Button>
      {open && (
        <div className="absolute right-0 bottom-full z-50 mb-2 rounded-lg border bg-popover p-2 shadow-md">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return
              onChange(formatDateValue(date))
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
