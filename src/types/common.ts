export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginationMeta {
  page: number
  size: number
  total: number
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationMeta
}

export type Id = number | string
