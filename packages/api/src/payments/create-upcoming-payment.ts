import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createPayable,
  findProjectForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const inputSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2000).optional(),
  amount: z.number().positive(),
  currency: z.string().trim().min(3).max(3),
  dueDate: z.coerce.date(),
})

export async function createUpcomingPaymentUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  rawInput: unknown
) {
  const parsed = inputSchema.safeParse(rawInput)
  if (!parsed.success) validationError("Enter a valid upcoming payment.")
  const [project] = await findProjectForOrganization(
    deps.executor,
    ctx.organizationId,
    parsed.data.projectId
  )
  if (!project) notFoundError("Project not found.")
  const created = await createPayable(deps.executor, {
    id: crypto.randomUUID(),
    organizationId: ctx.organizationId,
    projectId: parsed.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description,
    amountCents: Math.round(parsed.data.amount * 100),
    currency: parsed.data.currency,
    dueDate: parsed.data.dueDate,
    status: "pending",
  })
  if (!created) throw new Error("Payment insert failed")
  return created
}
