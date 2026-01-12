import http from '@/services/http';
import type {
  CurrentUserResponse,
  UsersListResponse,
  UsersQuery,
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
} from '@/types/user';

export const getCurrentUser = async () => {
  const { data } = await http.get<CurrentUserResponse>('/users/me');
  return data;
};

export const getUsers = async (params?: UsersQuery) => {
  const { data } = await http.get<UsersListResponse>('/users', { params });
  return data;
};

export const getUserDetail = async (id: number) => {
  const { data } = await http.get<CurrentUserResponse>(`/users/${id}`);
  return data;
};

export const updateUserStatus = async (payload: UpdateUserStatusPayload) => {
  const { data } = await http.patch<UpdateUserStatusResponse>(
    '/users',
    payload
  );
  return data;
};
