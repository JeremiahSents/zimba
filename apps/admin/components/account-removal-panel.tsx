"use client"

import { Alert01Icon, ShieldKeyIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { AccountRemovalBlocker } from "@workspace/api/schemas"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  deactivateUserAccountAction,
  deleteUserAccountAction,
  reactivateUserAccountAction,
} from "@/core/users/actions"

type Props = {
  userId: string
  email: string
  name: string
  deactivatedAt: Date | string | null
  deactivationReason: string | null
  blockers: AccountRemovalBlocker[]
  canDelete: boolean
}

/**
 * Two operations, deliberately unequal in weight. Deactivation is one click and
 * reversible. Deletion needs the account's email retyped and refuses to run
 * while any blocker stands, each of which is listed here rather than sprung as
 * an error after the fact.
 */
export function AccountRemovalPanel({
  userId,
  email,
  name,
  deactivatedAt,
  deactivationReason,
  blockers,
  canDelete,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const isDeactivated = Boolean(deactivatedAt)

  function run(action: () => Promise<{ success: boolean; error?: unknown }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        const message = (result.error as { message?: string } | undefined)
          ?.message
        setError(message ?? "The action could not be completed.")
        return
      }
      setConfirmEmail("")
      setReason("")
      router.refresh()
    })
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-base">
          <HugeiconsIcon
            icon={ShieldKeyIcon}
            className="size-4 text-destructive"
          />
          Account Removal
        </CardTitle>
        <CardDescription>
          Super admin only. Deactivation is reversible; deletion is not.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Account status</span>
          {isDeactivated ? (
            <Badge variant="destructive" className="text-xs">
              Deactivated
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/15 text-emerald-700 text-xs"
            >
              Active
            </Badge>
          )}
        </div>

        {isDeactivated ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-muted-foreground text-xs">
              Deactivated{" "}
              {deactivatedAt
                ? new Date(deactivatedAt).toLocaleString()
                : "recently"}
              . The account cannot sign in and every session was ended.
            </p>
            {deactivationReason ? (
              <p className="text-xs">
                <span className="text-muted-foreground">Reason: </span>
                {deactivationReason}
              </p>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={() => run(() => reactivateUserAccountAction(userId))}
            >
              {isPending ? "Reactivating…" : "Reactivate account"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <Label htmlFor="deactivation-reason" className="text-xs">
              Reason (optional, recorded in the audit log)
            </Label>
            <Input
              id="deactivation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Left the company"
              className="h-9"
            />
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={() =>
                run(() =>
                  deactivateUserAccountAction(
                    userId,
                    reason.trim() || undefined
                  )
                )
              }
            >
              {isPending ? "Deactivating…" : "Deactivate account"}
            </Button>
          </div>
        )}

        <div className="space-y-3 border-t pt-4">
          {blockers.length ? (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="flex items-center gap-1.5 font-medium text-amber-800 text-xs dark:text-amber-400">
                <HugeiconsIcon icon={Alert01Icon} className="size-3.5" />
                Cannot be deleted yet
              </p>
              <ul className="space-y-1.5">
                {blockers.map((blocker) => (
                  <li
                    key={`${blocker.code}-${blocker.organizationId ?? "none"}`}
                    className="text-muted-foreground text-xs leading-relaxed"
                  >
                    {blocker.message}
                    {blocker.organizationId ? (
                      <>
                        {" "}
                        <Link
                          href={`/organizations/${blocker.organizationId}`}
                          className="font-medium text-primary underline"
                        >
                          Open workspace
                        </Link>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Deleting removes the account, its sign-in methods and its
              memberships. Receipts, files and audit history stay with the
              organization, with the author cleared.
            </p>
          )}

          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl"
                  disabled={!canDelete || isPending}
                >
                  Delete permanently
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {name}&apos;s account?</DialogTitle>
                <DialogDescription>
                  This cannot be undone. Type <strong>{email}</strong> to
                  confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="confirm-email">Account email</Label>
                <Input
                  id="confirm-email"
                  value={confirmEmail}
                  onChange={(event) => setConfirmEmail(event.target.value)}
                  placeholder={email}
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button
                  variant="destructive"
                  disabled={
                    isPending ||
                    confirmEmail.trim().toLowerCase() !== email.toLowerCase()
                  }
                  onClick={() =>
                    run(() =>
                      deleteUserAccountAction(userId, confirmEmail.trim())
                    )
                  }
                >
                  {isPending ? "Deleting…" : "Delete account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
