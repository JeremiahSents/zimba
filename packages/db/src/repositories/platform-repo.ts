import { eq } from "drizzle-orm"
import { platformUser } from "../schemas/platform-schema"
import type { DatabaseExecutor } from "./types"

export function findPlatformUserForUser(executor: DatabaseExecutor, userId: string) {
  return executor.select().from(platformUser).where(eq(platformUser.userId, userId)).limit(1)
}
