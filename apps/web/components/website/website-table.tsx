'use client'

import type { Website } from '../../types/website'
import Link from 'next/link'
import { useState } from 'react'

import { StatusBadge } from '../status/status-badge'
import { formatDateTime, formatResponseTime } from '../../lib/utils'
import { ROUTES } from '../../lib/constants'
import { Button } from '../common/button'

interface WebsitesTableProps {
  websites: Website[]
  onDelete: (id: string) => Promise<void>
}

export function WebsitesTable({ websites, onDelete }: WebsitesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this website?')
    if (!confirmed) return

    try {
      setDeletingId(id)
      await onDelete(id)
    } catch (error) {
      console.error('Failed to delete website:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (websites.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <h3 className="text-sm font-semibold text-gray-900">No websites added yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add your first website to start monitoring uptime, incidents, and response times.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Latest Response Time
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Last Checked
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>

        <tbody>
          {websites.map((website) => {
            const isDeleting = deletingId === website.id

            return (
              <tr
                key={website.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="max-w-[280px]">
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-blue-600 hover:underline"
                      title={website.url}
                    >
                      {website.url}
                    </a>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={website.currentStatus ?? 'unknown'} size="sm" />
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {website.latestResponseTimeMs != null
                    ? formatResponseTime(website.latestResponseTimeMs)
                    : '—'}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {website.lastCheckedAt ? formatDateTime(website.lastCheckedAt) : 'Never'}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={ROUTES.WEBSITE_DETAIL(website.id)}>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isDeleting}
                        aria-label={`View details for ${website.url}`}
                      >
                        View
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(website.id)}
                      disabled={isDeleting}
                      aria-label={`Delete ${website.url}`}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}