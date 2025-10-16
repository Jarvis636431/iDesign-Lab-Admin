import type { AuthResponse, LoginPayload } from '../stores/auth'
import http from './http'

export const login = (payload: LoginPayload) => {
  return http.post<AuthResponse>('/auth/login', payload)
}
