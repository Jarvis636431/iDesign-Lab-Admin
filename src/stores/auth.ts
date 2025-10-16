import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginRequest } from '../services/auth'
import type { LoginPayload, LoginResponse } from '../types/auth'
import type { UserRole } from '../types/user'

const TOKEN_KEY = 'idesignlab_token'
const USER_KEY = 'idesignlab_user'

export interface AuthUser {
  id?: number
  name?: string
  account?: string
  phone?: string
  role?: UserRole
  avatar?: string
}

const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch (error) {
    console.warn('Failed to parse stored user', error)
    return null
  }
}

const mapLoginResponseToUser = (response: LoginResponse): AuthUser => ({
  name: response.name,
  account: response.account,
  phone: response.phone,
  role: response.role,
})

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(getStoredUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  const login = async (payload: LoginPayload) => {
    loading.value = true
    try {
      const response = await loginRequest(payload)
      token.value = response.token
      user.value = mapLoginResponseToUser(response)
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  }
})

export type AuthStore = ReturnType<typeof useAuthStore>
