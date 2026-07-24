import type { db } from "../index"

export type Database = typeof db
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0]
export type DatabaseExecutor = Database | DatabaseTransaction
export type TransactionRunner = <Result>(
  callback: (transaction: DatabaseTransaction) => Promise<Result>
) => Promise<Result>
