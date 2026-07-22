export type Id = string
export type CurrencyCode = string
export type Money = number
export type Pagination = { page: number; pageSize: number }
export type SearchParams = { search?: string; sortBy?: string; sortDirection?: "asc" | "desc" }
export type Page<T> = { items: T[]; page: number; pageSize: number; total: number }
