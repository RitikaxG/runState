import type { Check } from '../../types/website'
import { StatusBadge } from '../status/status-badge'
import {
  formatCheckTime,
  formatDateTime,
  formatResponseTime,
} from '../../lib/utils'

interface ChecksTableProps {
  checks: Check[]
}

const MAX_VISIBLE_CHECKS = 10

export function ChecksTable({ checks }: ChecksTableProps) {
  const visibleChecks = [...checks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_VISIBLE_CHECKS)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Region
              </th>
            </tr>
          </thead>

          <tbody>
            {checks.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No checks available yet.
                </td>
              </tr>
            ) : (
              visibleChecks.map((check) => (
                <tr
                  key={check.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td
                    className="px-6 py-4 text-sm text-gray-600"
                    title={formatDateTime(check.createdAt)}
                  >
                    {formatCheckTime(check.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={check.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatResponseTime(check.responseTimeMs)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {check.regionName || check.regionId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {checks.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing latest {Math.min(checks.length, MAX_VISIBLE_CHECKS)} checks
        </p>
      )}
    </div>
  )
}