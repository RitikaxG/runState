'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../../../components/common/button'
import { LoadingState } from '../../../components/common/loading-state'
import { ROUTES } from '../../../lib/constants'
import { useAuthStore } from '../../../stores/auth-store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isHydrated, isAuthenticated, user } = useAuthStore()

  if (!isHydrated) {
    return <LoadingState />
  }

  if (!isAuthenticated) {
    return null
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
          <p className="mt-3 text-sm text-gray-600">
            This area is only available to administrators.
          </p>

          <div className="mt-6">
            <Button onClick={() => router.push(ROUTES.DASHBOARD)} variant="primary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}