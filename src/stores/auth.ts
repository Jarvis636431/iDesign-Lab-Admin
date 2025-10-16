import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginRequest } from '../services/auth'
import { getCurrentUser } from '../services/user'
import type { LoginPayload } from '../types/auth'
import type { User } from '../types/user'

const TOKEN_KEY = 'idesignlab_token'
const USER_KEY = 'idesignlab_user'

export type AuthUser = User

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

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const user = ref<AuthUser | null>(getStoredUser())
  const loading = ref(false)
  const profileLoading = ref(false)
  const hasFetchedProfile = ref(false)

  const setToken = (value: string | null) => {
    token.value = value
    if (value) {
      localStorage.setItem(TOKEN_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

const setUser = (value: AuthUser | null) => {
    user.value = value
    if (value) {
      localStorage.setItem(USER_KEY, JSON.stringify(value))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  const isAuthenticated = computed(() => Boolean(token.value))

  const clearAuthState = () => {
    setToken(null)
    setUser(null)
    hasFetchedProfile.value = false
  }

  const fetchCurrentUser = async (force = false) => {
    if (!token.value) return null
    if (profileLoading.value) return user.value
    if (hasFetchedProfile.value && !force) return user.value
    profileLoading.value = true
    try {
      const response = await getCurrentUser()
      const current = response.data
      setUser(current)
      hasFetchedProfile.value = true
      return current
    } catch (error) {
      hasFetchedProfile.value = false
      clearAuthState()
      throw error
    } finally {
      profileLoading.value = false
    }
  }

  const login = async (payload: LoginPayload) => {
    loading.value = true
    try {
      const response = await loginRequest(payload)
      setToken(response.token)
      setUser(null)
      hasFetchedProfile.value = false
      await fetchCurrentUser(true)
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearAuthState()
  }

  return {
    token,
    user,
    loading,
    profileLoading,
    isAuthenticated,
    login,
    fetchCurrentUser,
    logout,
  }
})

export type AuthStore = ReturnType<typeof useAuthStore>
