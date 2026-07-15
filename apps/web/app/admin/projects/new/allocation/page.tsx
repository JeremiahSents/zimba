import { ProjectAllocationCreatePage } from "@/components/projects/project-allocation-create-page"
import { getDataMode } from "@/lib/api/data-mode"

export default function Page() {
  return (
    <ProjectAllocationCreatePage
      source={getDataMode() === "mock" ? "mock" : "api"}
    />
  )
}
