import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  deletePayableForOrganization,
  updatePayableForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const idSchema = z.string().min(1)
const updateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().trim().length(3).optional(),
  dueDate: z.coerce.date().optional(),
  status: z.string().trim().min(1).max(40).optional(),
})

export async function updateUpcomingPaymentUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  paymentId: unknown,
  rawInput: unknown
) {
  const id = idSchema.safeParse(paymentId)
  const input = updateSchema.safeParse(rawInput)
  if (!id.success || !input.success)
    validationError("Enter a valid payment update.")
  const updated = await updatePayableForOrganization(
    deps.executor,
    ctx.organizationId,
    id.data,
    {
      title: input.data.title,
      description: input.data.description,
      amountCents:
        input.data.amount === undefined
          ? undefined
          : Math.round(input.data.amount * 100),
      currency: input.data.currency,
      dueDate: input.data.dueDate,
      status: input.data.status,
    }
  )
  if (!updated) notFoundError("Payment not found.")
  return updated
}

export async function deleteUpcomingPaymentUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  paymentId: unknown
) {
  const id = idSchema.safeParse(paymentId)
  if (!id.success) validationError("Payment ID is required.")
  const deleted = await deletePayableForOrganization(
    deps.executor,
    ctx.organizationId,
    id.data
  )
  if (!deleted) notFoundError("Payment not found.")
  return deleted
}
