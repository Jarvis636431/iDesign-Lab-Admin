export type UserRole = 'student' | 'teacher' | 'admin' | 'temporary'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'banned'
export type ManagementScope = 'admin' | 'teacher'

export interface User {
  ID: number
  Name: string
  Account: string
  Phone: string
  Role: UserRole
  Status: UserStatus
  Purpose?: string
  Grade?: string
  CreatedAt?: string
  UpdatedAt?: string
  DeletedAt?: string | null
  Password?: string
}

export interface CurrentUserResponse {
  code: number
  message: string
  data: User
}

export interface ManagedUserBuckets {
  pending: User[]
  approved: User[]
  rejected: User[]
  banned: User[]
}

export interface ManagedUsersResponse {
  student: ManagedUserBuckets
  temporary: ManagedUserBuckets
}

export interface UpdateUserStatusPayload {
  user_ids: number[]
  status: UserStatus
  reason?: string
}

export interface UpdateUserStatusResponse {
  message: string
  updated_count: number
}
