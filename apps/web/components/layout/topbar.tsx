'use client'

import { useUIStore } from '../../stores/ui-store'
import { useAuth } from '../../hooks/use-auth'

export function Topbar() {
  const { toggleSidebar } = useUIStore()
  const { user } = useAuth()

  const email = user?.email ?? 'User'
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-lg p-2 transition hover:bg-gray-100"
      >
        ☰
      </button>

      <div className="flex items-center gap-4">
        <span className="text-gray-700">{email}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
          {initial}
        </div>
      </div>
    </header>
  )
}