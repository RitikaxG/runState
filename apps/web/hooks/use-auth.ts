'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '../stores/auth-store'
import { useUIStore } from '../stores/ui-store'
import { ROUTES } from '../lib/constants'
import { parseErrorMessage } from '../lib/utils'

export function useAuth() {
  const router = useRouter()

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signin,
    signup,
    logout,
    clearError,
  } = useAuthStore()

  const { showToast } = useUIStore()

  const handleSignin = async (email: string, password: string) => {
    try {
      clearError()
      await signin(email, password)
      showToast('Signed in successfully', 'success')
      router.push(ROUTES.DASHBOARD)
    } catch (err) {
      const message = parseErrorMessage(err)
      showToast(message, 'error')
      throw err
    }
  }

  const handleSignup = async (email: string, password: string) => {
    try {
      clearError()
      await signup(email, password)
      showToast('Account created successfully', 'success')
      router.push(ROUTES.DASHBOARD)
    } catch (err) {
      const message = parseErrorMessage(err)
      showToast(message, 'error')
      throw err
    }
  }

  const handleLogout = async () => {
    try {
      clearError()
      await logout()
      showToast('Logged out successfully', 'success')
      router.push(ROUTES.SIGNIN)
    } catch (err) {
      showToast(parseErrorMessage(err), 'error')
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signin: handleSignin,
    signup: handleSignup,
    logout: handleLogout,
    clearError,
  }
}