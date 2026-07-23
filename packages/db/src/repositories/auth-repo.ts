import { eq } from "drizzle-orm"
import { user } from "../schemas/auth-schema"
import type { DatabaseExecutor } from "./types"

export function findUserById(executor: DatabaseExecutor, userId: string) {
  return executor.select().from(user).where(eq(user.id, userId)).limit(1)
}

export function updateUserName(
  executor: DatabaseExecutor,
  userId: string,
  name: string
) {
  return executor
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId))
}

export function findUserByEmail(executor: DatabaseExecutor, email: string) {
  return executor.select().from(user).where(eq(user.email, email)).limit(1)
}
