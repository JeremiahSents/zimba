"use client"

import { DayPicker } from "react-day-picker"

export function Calendar({
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      classNames={{
        root: "p-1",
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "font-medium text-sm",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-2 top-3 grid size-7 place-items-center rounded-md hover:bg-muted",
        button_next:
          "absolute right-2 top-3 grid size-7 place-items-center rounded-md hover:bg-muted",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "size-8 text-center font-normal text-[10px] text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-8 p-0 text-center text-sm",
        day_button:
          "grid size-8 place-items-center rounded-md font-normal hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected: "rounded-md bg-primary text-primary-foreground",
        today: "font-semibold text-primary",
        outside: "text-muted-foreground opacity-45",
        disabled: "text-muted-foreground opacity-45",
        ...classNames,
      }}
      {...props}
    />
  )
}
