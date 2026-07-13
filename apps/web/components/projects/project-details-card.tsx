"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { UploadZone } from "@/components/projects/upload-zone"

const buildingTypes = ["Residential", "Commercial", "Mixed use", "Industrial"]

export type ProjectDetails = {
  name: string
  location: string
  landSize: string
  buildingType: string
}

type ProjectDetailsCardProps = {
  details: ProjectDetails
  onDetailChange: (field: keyof ProjectDetails, value: string) => void
  files: File[]
  onFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
}

export function ProjectDetailsCard({
  details,
  onDetailChange,
  files,
  onFiles,
  onRemoveFile,
}: ProjectDetailsCardProps) {
  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>Project details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Project name"
            value={details.name}
            onChange={(value) => onDetailChange("name", value)}
            placeholder="Kironde Road Apartments"
            required
          />
          <Field
            label="Location"
            value={details.location}
            onChange={(value) => onDetailChange("location", value)}
            placeholder="Kololo, Kampala"
            required
          />
          <Field
            label="Land size"
            value={details.landSize}
            onChange={(value) => onDetailChange("landSize", value)}
            placeholder="2.5 acres"
            required
          />
          <label className="grid gap-2">
            <Label>Building type</Label>
            <Select
              value={details.buildingType}
              onValueChange={(value) =>
                onDetailChange("buildingType", value ?? "")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {buildingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <UploadZone files={files} onFiles={onFiles} onRemove={onRemoveFile} />
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <label className="grid gap-2">
      <Label>{label}</Label>
      <Input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
