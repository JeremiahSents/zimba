"use client"

const DATABASE = "zimba-offline"
const STORE = "receipt-drafts"

export type ReceiptDraft<T> = { value: T; files: File[]; updatedAt: number }

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function readReceiptDraft<T>(key: string): Promise<ReceiptDraft<T> | null> {
  const database = await openDatabase()
  const result = await new Promise<ReceiptDraft<T> | undefined>((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  database.close()
  if (!result || Date.now() - result.updatedAt > 7 * 24 * 60 * 60 * 1000) {
    if (result) await deleteReceiptDraft(key)
    return null
  }
  return result
}

export async function writeReceiptDraft<T>(key: string, value: T, files: File[]) {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE, "readwrite").objectStore(STORE).put({ value, files, updatedAt: Date.now() }, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  database.close()
}

export async function deleteReceiptDraft(key: string) {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE, "readwrite").objectStore(STORE).delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  database.close()
}
