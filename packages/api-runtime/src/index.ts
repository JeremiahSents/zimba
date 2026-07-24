import "server-only"

import { checkDatabaseHealth, db } from "@workspace/db"

export const apiExecutor = { executor: db }
export const apiTransaction = {
  transaction: <Result>(
    callback: Parameters<typeof db.transaction<Result>>[0]
  ) => db.transaction(callback),
}
export const apiDatabase = {
  ...apiExecutor,
  ...apiTransaction,
}

export function checkApiDatabaseHealth() {
  return checkDatabaseHealth()
}
