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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Loading session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-64">
        <Topbar />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <Toast />
    </div>
  )
}