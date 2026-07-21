"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useState } from "react"
import { sendSuperAdminInviteAction } from "@/app/settings/actions"
import type { PublicError } from "@/core/shared/errors"

export function SuperAdminInviteForm() {
  const [error, setError] = useState<PublicError | null>(null)
  const [message, setMessage] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Super Admin</CardTitle>
        <CardDescription>
          Send an invitation to an internal operator. They will receive an email
          with a link to accept Super Admin access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={async (formData) => {
            const result = await sendSuperAdminInviteAction({
              email: String(formData.get("email")),
              name: String(formData.get("name")),
            })
            setError(null)
            if (!result.success) return setError(result.error)
            setMessage("Invitation email sent successfully.")
          }}
        >
          <div>
            <Label htmlFor="invite-name">Name</Label>
            <Input id="invite-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" required />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Send Super Admin invite</Button>
            {error && (
              <p className="mt-2 text-destructive text-sm" role="alert">
                {error.message}
              </p>
            )}
            {message && (
              <p className="mt-2 text-muted-foreground text-sm" role="status">
                {message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
