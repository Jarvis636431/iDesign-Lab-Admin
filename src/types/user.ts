export type UserRole = 'student' | 'teacher' | 'admin' | 'temporary'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'banned'
export type ManagementScope = 'admin' | 'teacher'

export interface User {
  id: number
  name: string
  account: string
  phone: string
  role: UserRole
  status: UserStatus
  grade?: string
  purpose?: string
  created_at?: string
  updated_at?: string
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
