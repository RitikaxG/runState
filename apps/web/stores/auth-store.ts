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
  error: string | null

  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError: () => void
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
  if (err instanceof APIError) {
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signin: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.signin(email, password)
          const authData = response.data

          if (!response.success || !authData) {
            throw new Error(response.error || 'Signin failed')
          }

          const userRes = await authAPI.me(authData.access_token)
          const userData = userRes.data

          if (!userRes.success || !userData) {
            throw new Error(userRes.error || 'Failed to load user profile')
          }

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
          const errorMessage = getErrorMessage(err, 'Signin failed')

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
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
          const errorMessage = getErrorMessage(err, 'Signup failed')

          set({
            isLoading: false,
            error: errorMessage,
          })

          throw err
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken

        try {
          set({ isLoading: true, error: null })

          if (refreshToken) {
            await authAPI.logout(refreshToken)
          }
        } catch {
          // Ignore logout API failure and still clear client auth state
        } finally {
          clearTokenCookie('access_token')
          clearTokenCookie('refresh_token')

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authAPI.refreshToken(refreshToken)
          const data = response.data

          if (!response.success || !data) {
            throw new Error(response.error || 'Failed to refresh session')
          }

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
        } catch {
          clearTokenCookie('access_token')
          clearTokenCookie('refresh_token')

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please sign in again.',
          })
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
    }
  )
)