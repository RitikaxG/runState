'use client'

import { useEffect, useState } from 'react'
import { publicAPI } from '../../../lib/api'
import { LoadingState } from '../../../components/common/loading-state'
import { ErrorState } from '../../../components/common/error-state'
import { StatusBadge } from '../../../components/status/status-badge'
import { Card, CardBody } from '../../../components/common/card'
import type { WebsiteStatus } from '../../../types/common'
import { parseErrorMessage } from '../../../lib/utils'

interface StatusPageData {
  websites: Array<{
    id: string
    url: string
    currentStatus: WebsiteStatus
  }>
}

export default function StatusPage({
  params,
}: {
  params: { slug: string }
}) {
  const [data, setData] = useState<StatusPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatusPage = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await publicAPI.getStatusPage(params.slug)
        if (!response.success) {
          throw new Error(response.error || 'Failed to load status page')
        }

        const websites = response.data?.websites ?? []

        setData({
          websites: websites.map((website) => ({
            id: website.id,
            url: website.url,
            currentStatus: website.current_status,
          })),
        })
      } catch (err) {
        setError(parseErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchStatusPage()
  }, [params.slug])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <ErrorState message={error} />
      </div>
    )
  }

  const websites = data?.websites ?? []

  const overallStatus: WebsiteStatus =
    websites.length === 0
      ? 'unknown'
      : websites.every((website) => website.currentStatus === 'up')
        ? 'up'
        : 'down'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">RunState Status</h1>
          <p className="text-gray-600">System status and uptime information</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Card className="mb-8">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Overall Status
                </h2>
                <p className="text-gray-600">
                  {overallStatus === 'up'
                    ? 'All systems operational'
                    : overallStatus === 'down'
                      ? 'Some systems experiencing issues'
                      : 'No monitored services available'}
                </p>
              </div>

              <StatusBadge status={overallStatus} size="lg" />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            Monitored Services
          </h3>

          {websites.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-gray-600">No services are currently listed on this status page.</p>
              </CardBody>
            </Card>
          ) : (
            websites.map((website) => (
              <Card key={website.id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{website.url}</p>
                  </div>
                  <StatusBadge status={website.currentStatus} size="md" />
                </CardBody>
              </Card>
            ))
          )}
        </div>

        <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-gray-600">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-2 text-sm">
            Powered by{' '}
            <a href="/" className="text-blue-600 hover:underline">
              RunState
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}