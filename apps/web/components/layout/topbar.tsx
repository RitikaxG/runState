'use client'

import { useUIStore } from '../../stores/ui-store'
import { useAuth } from '../../hooks/use-auth'

export function Topbar() {
  const { toggleSidebar } = useUIStore()
  const { user } = useAuth()

  const email = user?.email ?? 'User'
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={toggleSidebar}
        className="mr-3 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="flex-1">
        <h1 className="text-sm font-medium text-slate-600">Monitoring Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-slate-600 sm:block">{email}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initial}
        </div>
      </div>
    </header>
  )
}