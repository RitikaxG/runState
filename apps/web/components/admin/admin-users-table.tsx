'use client'

import type { AdminUserDTO } from '../../types/api'

interface AdminUsersTableProps {
  users: AdminUserDTO[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <h3 className="text-sm font-semibold text-gray-900">No users found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Registered users will appear here for admin inspection.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[680px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Role
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              User ID
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const isAdmin = user.role === 'ADMIN'

            return (
              <tr
                key={user.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      isAdmin
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}