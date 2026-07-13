"use client"

import { Card } from "@workspace/ui/components/card"

type ProjectPreviewCardProps = {
  name: string
  location: string
  buildingType: string
  landSize: string
  files: File[]
  totalBudget: number
}

export function ProjectPreviewCard({
  name,
  location,
  buildingType,
  landSize,
  files,
  totalBudget,
}: ProjectPreviewCardProps) {
  const previewImage =
    files.length > 0 && files[0]?.type.startsWith("image/")
      ? URL.createObjectURL(files[0])
      : "/project-placeholder.png"

  return (
    <Card className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden lg:aspect-[3/4]">
      <img
        src={previewImage}
        alt="Project preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative z-10 mt-auto grid gap-3 p-5 text-white">
        <div>
          <h3 className="font-bold font-heading text-2xl leading-tight drop-shadow-md">
            {name || "New Project"}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90 drop-shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location || "Location not set"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {buildingType && (
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 font-semibold text-xs drop-shadow-sm backdrop-blur-md">
              {buildingType}
            </span>
          )}
          {landSize && (
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/90 px-2.5 py-0.5 font-semibold text-primary-foreground text-xs drop-shadow-sm backdrop-blur-md">
              {landSize}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-end justify-between border-white/20 border-t pt-4">
          <div>
            <p className="font-medium text-white/70 text-xs uppercase tracking-wider">
              Total Budget
            </p>
            <p className="mt-0.5 font-bold font-heading text-xl tracking-tight">
              {totalBudget.toLocaleString()} UGX
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
