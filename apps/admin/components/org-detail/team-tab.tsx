import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type Member = {
  id: string
  role: string
  responsibility: string | null
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

export function OrgDetailTeamTab({ members }: { members: Member[] }) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-base">
          Organization Members
        </CardTitle>
        <CardDescription>
          Users with access to this tenant organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Responsibility</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No members assigned.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {member.user.image ? (
                          <AvatarImage
                            src={member.user.image}
                            alt={member.user.name}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 font-medium text-primary text-xs">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">
                          {member.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.role.toLowerCase() === "owner" ||
                        member.role.toLowerCase() === "admin"
                          ? "border-emerald-500/20 bg-emerald-500/15 font-semibold text-emerald-700 text-xs capitalize dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "border-blue-500/20 bg-blue-500/15 font-medium text-blue-700 text-xs capitalize dark:bg-blue-500/10 dark:text-blue-400"
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {member.responsibility || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(member.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
