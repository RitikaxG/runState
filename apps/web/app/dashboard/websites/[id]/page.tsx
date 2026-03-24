'use client'

import { useRouter } from 'next/navigation'
import { useWebsiteDetail } from '../../../../hooks/use-website-detail'
import { Card, CardHeader, CardBody } from '../../../../components/common/card'
import { Button } from '../../../../components/common/button'
import { LoadingState } from '../../../../components/common/loading-state'
import { ErrorState } from '../../../../components/common/error-state'
import { EmptyState } from '../../../../components/common/empty-state'
import { StatusBadge } from '../../../../components/status/status-badge'
import { ChecksTable } from '../../../../components/website/checks-table'
import { IncidentsList } from '../../../../components/website/incident-list'
import { NotificationsList } from '../../../../components/website/notification-list'
import { ResponseTimeChart } from '../../../../components/website/response-time-chart'
import { formatDateTime } from '../../../../lib/utils'
import { ROUTES } from '../../../../lib/constants'

export default function WebsiteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  const {
    website,
    checks,
    responseTimes,
    incidents,
    notifications,
    isLoading,
    error,
  } = useWebsiteDetail(params.id)

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !website) {
    return (
      <ErrorState
        message={error || 'Website not found'}
        onRetry={() => router.push(ROUTES.DASHBOARD)}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{website.url}</h1>

          <div className="flex items-center gap-4">
            <StatusBadge status={website.currentStatus} size="lg" />
            <span className="text-gray-600">
              Added: {formatDateTime(website.timeAdded)}
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.DASHBOARD)}
        >
          ← Back
        </Button>
      </div>

      {responseTimes.length > 0 && (
        <Card>
          <CardBody>
            <ResponseTimeChart data={responseTimes} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Recent Checks</h2>
        </CardHeader>
        <CardBody>
          {checks.length === 0 ? (
            <EmptyState
              title="No checks yet"
              description="Checks will appear once monitoring starts"
              icon="⏳"
            />
          ) : (
            <ChecksTable checks={checks} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Incidents</h2>
        </CardHeader>
        <CardBody>
          {incidents.length === 0 ? (
            <EmptyState
              title="No incidents"
              description="Website has been running smoothly"
              icon="✓"
            />
          ) : (
            <IncidentsList incidents={incidents} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </CardHeader>
        <CardBody>
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="No alerts have been sent yet"
              icon="📭"
            />
          ) : (
            <NotificationsList notifications={notifications} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}