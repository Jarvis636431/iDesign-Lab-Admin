import http from './http'
import type { ApiResponse } from '../types/common'
import type {
  CurrentUserResponse,
  ManagedUsersResponse,
  ManagementScope,
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
  User,
} from '../types/user'

const scopedUserPath = (scope: ManagementScope, path: string) => `/${scope}${path}`

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const { data } = await http.get<CurrentUserResponse>('/user/current')
  return {
    code: data.code,
    message: data.message,
    data: data.data,
  }
}

export const getManagedUsers = async (scope: ManagementScope) => {
  const { data } = await http.get<ManagedUsersResponse>(scopedUserPath(scope, '/users'))
  return data
}

export const getManagedUserDetail = async (scope: ManagementScope, id: number) => {
  const { data } = await http.get<ApiResponse<User>>(scopedUserPath(scope, `/users/${id}`))
  return data
}

export const updateManagedUserStatus = async (
  scope: ManagementScope,
  payload: UpdateUserStatusPayload
) => {
  const { data } = await http.put<UpdateUserStatusResponse>(
    scopedUserPath(scope, '/users/status'),
    payload
  )
  return data
}
