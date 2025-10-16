import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginRequest } from '../services/auth'

const TOKEN_KEY = 'idesignlab_token'
const USER_KEY = 'idesignlab_user'

export interface LoginPayload {
  username: string
  password: string
}

export interface UserInfo {
  id: string
  name: string
  role?: string
  avatar?: string
}

export interface AuthResponse {
  token: string
  user: UserInfo
}

const getStoredUser = (): UserInfo | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch (error) {
    console.warn('Failed to parse stored user', error)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<UserInfo | null>(getStoredUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  const login = async (payload: LoginPayload) => {
    loading.value = true
    try {
      const { data } = await loginRequest(payload)
      token.value = data.token
      user.value = data.user
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data
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
