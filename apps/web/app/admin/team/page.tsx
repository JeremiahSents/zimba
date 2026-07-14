import type { Metadata } from "next"

import { TeamPage } from "@/components/team/team-page"

export const metadata: Metadata = {
  title: "Team | Zimba",
  description: "Team access preview for Zimba construction project tracking.",
}

export default function Page() {
  return <TeamPage />
}
