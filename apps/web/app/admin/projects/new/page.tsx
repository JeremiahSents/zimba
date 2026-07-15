import { ProjectCreatePage } from "@/components/projects/project-create-page"
import { getDataMode } from "@/lib/api/data-mode"

export default function Page() {
  return (
    <ProjectCreatePage source={getDataMode() === "mock" ? "mock" : "api"} />
  )
}
