import http from './http';
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
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
  const { data } = await http.post<ChangePasswordResponse>(
    '/auth/change-password',
    payload
  );
  return data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await http.post<ResetPasswordResponse>(
    '/auth/reset-password',
    payload
  );
  return data;
};
