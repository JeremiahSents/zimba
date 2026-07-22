import { eq } from "drizzle-orm"
import { user } from "../schemas/auth-schema"
import type { DatabaseExecutor } from "./types"

export function findUserById(executor: DatabaseExecutor, userId: string) {
  return executor.select().from(user).where(eq(user.id, userId)).limit(1)
}
