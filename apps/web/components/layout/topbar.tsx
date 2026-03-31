'use client'

import { usePathname } from 'next/navigation'
import { useUIStore } from '../../stores/ui-store'
import { useAuth } from '../../hooks/use-auth'
import { ROUTES } from '../../lib/constants'

function getPageTitle(pathname: string) {
  if (
    pathname === ROUTES.ADMIN_DASHBOARD ||
    pathname.startsWith(`${ROUTES.ADMIN_DASHBOARD}/`)
  ) {
    return 'Admin Console'
  }

  if (pathname.startsWith('/dashboard/websites/')) {
    return 'Website Details'
  }

  return 'Monitoring Dashboard'
}

export function Topbar() {
  const pathname = usePathname()
  const { toggleSidebar } = useUIStore()
  const { user } = useAuth()

  const email = user?.email ?? 'User'
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U'
  const isAdmin = user?.role === 'ADMIN'
  const title = getPageTitle(pathname)

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
        <h1 className="text-sm font-medium text-slate-600">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          {isAdmin && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Admin
            </span>
          )}
          <div className="text-sm text-slate-600">{email}</div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initial}
        </div>
      </div>
    </header>
  )
}