import type { UserRole } from './common'

export type User = {
  id: string
  email: string
  role: UserRole
}

export type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}