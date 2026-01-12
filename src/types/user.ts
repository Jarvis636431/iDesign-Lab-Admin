import type { ApiResponse, ListResponseData } from './common';

export type UserRole = 'student' | 'teacher' | 'admin' | 'temporary';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'banned';

export interface User {
  id: number;
  name: string;
  account: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  grade?: string;
  purpose?: string;
  created_at?: string;
  updated_at?: string;
}

export type CurrentUserResponse = ApiResponse<User>;

export interface UsersQuery {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
}

export interface UpdateUserStatusPayload {
  user_ids: number[];
  status: UserStatus;
  reason?: string;
}

export type UsersListResponse = ApiResponse<ListResponseData<User[]>>;

export type UpdateUserStatusResponse = ApiResponse<{
  updated_count: number;
  status: UserStatus;
  user_ids: number[];
}>;
