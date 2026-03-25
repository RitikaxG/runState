'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { Toast } from '../common/toast'
import { useAuthStore } from '../../stores/auth-store'
import { ROUTES } from '../../lib/constants'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const {
    isHydrated,
    isAuthenticated,
    accessToken,
    refreshToken,
    refreshAccessToken,
  } = useAuthStore()

  useEffect(() => {
    const guard = async () => {
      if (!isHydrated) return

      if (!isAuthenticated) {
        router.replace(ROUTES.SIGNIN)
        return
      }

      if (!accessToken && refreshToken) {
        const ok = await refreshAccessToken()
        if (!ok) {
          router.replace(ROUTES.SIGNIN)
        }
        return
      }

      if (!accessToken && !refreshToken) {
        router.replace(ROUTES.SIGNIN)
      }
    }

    void guard()
  }, [
    isHydrated,
    isAuthenticated,
    accessToken,
    refreshToken,
    refreshAccessToken,
    router,
    pathname,
  ])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <Toast />
    </div>
  )
}