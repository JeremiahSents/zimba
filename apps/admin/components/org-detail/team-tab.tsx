import { TeamTable } from "@/components/org-detail/team-table"

type Member = {
  id: string
  role: string
  responsibility: string | null
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

export function OrgDetailTeamTab({ members }: { members: Member[] }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <section>
        <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
          Organization members
        </p>
      </section>

      <TeamTable members={members} title="Team members" />
    </div>
  )
}
