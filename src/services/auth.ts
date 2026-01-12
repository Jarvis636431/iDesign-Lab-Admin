import http from './http';
import type {
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from '../types/auth';

export const register = async (payload: RegisterPayload) => {
  const { data } = await http.post<RegisterResponse>('/auth/register', payload);
  return data;
};

export const login = async (payload: LoginPayload) => {
  const { data } = await http.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const { data } = await http.post<{ message: string }>(
    '/auth/change-password',
    payload
  );
  return data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await http.post<{ message: string }>(
    '/auth/reset-password',
    payload
  );
  return data;
};
