'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authAPI, APIError } from '../lib/api'
import type { User } from '../types/auth'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  error: string | null

  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  clearError: () => void
  clearAuthState: () => void
  setHydrated: (value: boolean) => void
}

const isProduction = process.env.NODE_ENV === 'production'

function setTokenCookie(name: string, value: string, expiresAt: Date) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `expires=${expiresAt.toUTCString()}`,
    'SameSite=Lax',
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
}

function clearTokenCookie(name: string) {
  document.cookie = [
    `${name}=`,
    'path=/',
    'expires=Thu, 01 Jan 1970 00:00:00 UTC',
    'SameSite=Lax',
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof APIError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}

function clearAllAuthCookies() {
  clearTokenCookie('access_token')
  clearTokenCookie('refresh_token')
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      clearAuthState: () => {
        clearAllAuthCookies()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      signin: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.signin(email, password)

          if (!response.success) {
            throw new Error(response.error || 'Signin failed')
          }

          const authData = response.data

          const userRes = await authAPI.me(authData.access_token)

          if (!userRes.success) {
            throw new Error(userRes.error || 'Failed to load user profile')
          }

          const userData = userRes.data

          const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
          const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

          setTokenCookie('access_token', authData.access_token, accessExpiresAt)
          setTokenCookie('refresh_token', authData.refresh_token, refreshExpiresAt)

          set({
            user: userData,
            accessToken: authData.access_token,
            refreshToken: authData.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err) {
          get().clearAuthState()
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Signin failed'),
          })
          throw err
        }
      },

      signup: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.signup(email, password)

          if (!response.success) {
            throw new Error(response.error || 'Signup failed')
          }

          await get().signin(email, password)
        } catch (err) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Signup failed'),
          })
          throw err
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken

        try {
          set({ isLoading: true, error: null })

          if (refreshToken) {
            const response = await authAPI.logout(refreshToken)

            if (!response.success) {
              throw new Error(response.error || 'Logout failed')
            }
          }
        } catch {
          // still clear local auth state for demo UX
        } finally {
          get().clearAuthState()
        }
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken

          if (!refreshToken) {
            get().clearAuthState()
            return false
          }

          const response = await authAPI.refreshToken(refreshToken)

          if (!response.success) {
            get().clearAuthState()
            set({ error: response.error || 'Session expired. Please sign in again.' })
            return false
          }

          const data = response.data

          const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
          const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

          setTokenCookie('access_token', data.access_token, accessExpiresAt)
          setTokenCookie('refresh_token', data.refresh_token, refreshExpiresAt)

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            error: null,
          })

          return true
        } catch {
          get().clearAuthState()
          set({
            error: 'Session expired. Please sign in again.',
          })
          return false
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)