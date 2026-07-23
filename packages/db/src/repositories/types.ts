import type { PgDatabase } from "drizzle-orm/pg-core"
import type { PgTransaction } from "drizzle-orm/pg-core"

export type DatabaseExecutor =
  | PgDatabase<any, any, any>
  | PgTransaction<any, any, any>
