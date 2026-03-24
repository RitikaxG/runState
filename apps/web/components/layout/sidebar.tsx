'use client'

import Link from 'next/link'
import { useUIStore } from '../../stores/ui-store'
import { useAuth } from '../../hooks/use-auth'
import { ROUTES } from '../../lib/constants'

export function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside
      aria-hidden={!sidebarOpen}
      className={`flex flex-col overflow-hidden bg-gray-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className="border-b border-gray-800 p-6">
        <h1 className="whitespace-nowrap text-2xl font-bold">RunState</h1>
      </div>

      <nav className="flex-1 space-y-4 p-6">
        <Link
          href={ROUTES.DASHBOARD}
          className="block whitespace-nowrap rounded-lg px-4 py-2 transition hover:bg-gray-800"
          tabIndex={sidebarOpen ? 0 : -1}
        >
          📊 Dashboard
        </Link>
      </nav>

      <div className="border-t border-gray-800 p-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-600 px-4 py-2 transition hover:bg-red-700"
          tabIndex={sidebarOpen ? 0 : -1}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}