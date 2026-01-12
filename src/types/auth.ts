import type { UserRole } from './user';

export interface RegisterPayload {
  name: string;
  account: string;
  password: string;
  phone: string;
  grade?: string;
  purpose?: string;
  role: Extract<UserRole, 'student' | 'temporary'>;
}

export interface RegisterResponse {
  message: string;
  status: 'pending';
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  role: UserRole;
  account: string;
  name: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ResetPasswordPayload {
  account: string;
  phone: string;
  new_password: string;
}
