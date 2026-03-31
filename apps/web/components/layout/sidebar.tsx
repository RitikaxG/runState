'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '../../stores/ui-store'
import { useAuth } from '../../hooks/use-auth'
import { ROUTES } from '../../lib/constants'

type NavItem = {
  label: string
  href: string
  isActive: (pathname: string) => boolean
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuth()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: ROUTES.DASHBOARD,
      isActive: (currentPath) =>
        currentPath === ROUTES.DASHBOARD ||
        currentPath.startsWith('/dashboard/websites/'),
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: 'Admin',
            href: ROUTES.ADMIN_DASHBOARD,
            isActive: (currentPath: string) =>
              currentPath === ROUTES.ADMIN_DASHBOARD ||
              currentPath.startsWith(`${ROUTES.ADMIN_DASHBOARD}/`),
          },
        ]
      : []),
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="text-lg font-semibold text-slate-900">RunState</span>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = item.isActive(pathname)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}