"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
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
  const isMobile = useIsMobile()
  const selected = parseDate(value)

  useLayoutEffect(() => {
    if (!open || isMobile) return

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
  }, [isMobile, open])

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    onChange(formatDateValue(date))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div ref={triggerRef} className="relative">
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-start gap-2 font-normal"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="dialog"
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
        {!isMobile &&
          open &&
          createPortal(
            <div
              ref={popupRef}
              className="fixed z-[70] rounded-lg border bg-popover p-2 shadow-md"
              style={{ left: position.left, top: position.top }}
            >
              <Calendar
                mode="single"
                selected={selected}
                onSelect={handleSelect}
              />
            </div>,
            document.body
          )}
      </div>
      {isMobile && (
        <DialogContent className="max-w-[340px] rounded-[24px] p-5">
          <DialogHeader className="relative mb-2 pr-8 text-left">
            <DialogTitle>Select date</DialogTitle>
            <DialogDescription>
              Choose a date from the calendar below.
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close calendar"
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 rounded-full text-muted-foreground"
            >
              ×
            </Button>
          </DialogHeader>
          <div className="flex justify-center pb-2">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              classNames={{
                root: "relative w-full p-0",
                months: "w-full",
                month: "w-full space-y-4",
                month_caption: "flex h-11 items-center justify-center",
                button_previous:
                  "absolute top-2 left-1 grid size-11 place-items-center rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                button_next:
                  "absolute top-2 right-1 grid size-11 place-items-center rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                month_grid: "w-full border-collapse",
                weekdays: "grid grid-cols-7",
                weekday:
                  "grid h-11 place-items-center font-normal text-[11px] text-muted-foreground",
                week: "grid w-full grid-cols-7",
                day: "grid min-h-11 place-items-center p-0 text-center text-sm",
                day_button:
                  "grid size-11 place-items-center rounded-xl font-normal hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              }}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
