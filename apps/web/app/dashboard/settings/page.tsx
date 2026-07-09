import type { Metadata } from "next"

import { SettingsPage } from "@/components/dashboard/features/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings | Zimba",
  description: "Settings preview for Zimba construction project tracking.",
}

export default function Page() {
  return <SettingsPage />
}
