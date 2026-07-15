"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

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
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const selected = parseDate(value)

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      if (!trigger) return
      const popupWidth = 288
      const popupHeight = 320
      const gap = 8
      const left = Math.max(
        12,
        Math.min(
          trigger.right - popupWidth,
          window.innerWidth - popupWidth - 12
        )
      )
      const top =
        window.innerHeight - trigger.bottom >= popupHeight + gap
          ? trigger.bottom + gap
          : Math.max(12, trigger.top - popupHeight - gap)
      setPosition({ left, top })
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Select date"
        className="md:hidden"
      />
      <div ref={triggerRef} className="relative hidden md:block">
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
            timeZone: "Africa/Nairobi",
            year: "numeric",
          })}
        </Button>
        {open &&
          createPortal(
            <div
              ref={popupRef}
              className="fixed z-[70] rounded-lg border bg-popover p-2 shadow-md"
              style={{ left: position.left, top: position.top }}
            >
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (!date) return
                  onChange(formatDateValue(date))
                  setOpen(false)
                }}
              />
            </div>,
            document.body
          )}
      </div>
    </>
  )
}
