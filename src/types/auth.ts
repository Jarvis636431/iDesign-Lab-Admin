import type { ApiResponse } from '@/types/common';
import type { UserRole } from '@/types/user';

export interface RegisterPayload {
  name: string;
  account: string;
  password: string;
  phone: string;
  grade?: string;
  purpose?: string;
  role: Extract<UserRole, 'student' | 'temporary'>;
}

export type RegisterResponse = ApiResponse<{
  status: 'pending';
}>;

export interface LoginPayload {
  account: string;
  password: string;
}

export type LoginResponse = ApiResponse<{
  token: string;
  role: UserRole;
  account: string;
  name: string;
  phone?: string;
}>;

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export type ChangePasswordResponse = ApiResponse<null>;

export interface ResetPasswordPayload {
  account: string;
  phone: string;
  new_password: string;
}

export type ResetPasswordResponse = ApiResponse<null>;
