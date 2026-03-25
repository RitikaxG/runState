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
import { formatDateTime, formatResponseTime } from '../../../../lib/utils'
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

    isLoadingDetail,
    isLoadingChecks,
    isLoadingResponseTimes,
    isLoadingIncidents,
    isLoadingNotifications,

    detailError,
    checksError,
    responseTimesError,
    incidentsError,
    notificationsError,
  } = useWebsiteDetail(params.id)

  if (isLoadingDetail) {
    return <LoadingState />
  }

  if (detailError || !website) {
    return (
      <ErrorState
        message={detailError || 'Website not found'}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Current Status</p>
            <div className="mt-3">
              <StatusBadge status={website.currentStatus} size="md" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Last Checked</p>
            <p className="mt-3 text-base font-semibold text-gray-900">
              {website.lastCheckedAt ? formatDateTime(website.lastCheckedAt) : 'Never'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Latest Response Time</p>
            <p className="mt-3 text-base font-semibold text-gray-900">
              {formatResponseTime(website.latestResponseTimeMs)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Incident Status</p>
            <p
              className={`mt-3 text-base font-semibold ${
                website.activeIncident?.isActive ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {website.activeIncident?.isActive ? 'Active Incident' : 'No Active Incident'}
            </p>
            {website.activeIncident?.isActive && (
              <p className="mt-1 text-sm text-gray-500">
                Started {formatDateTime(website.activeIncident.startedAt)}
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Monitor Created</p>
            <p className="mt-3 text-base font-semibold text-gray-900">
              {formatDateTime(website.timeAdded)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Response Time</h2>
        </CardHeader>
        <CardBody>
          {isLoadingResponseTimes ? (
            <LoadingState />
          ) : responseTimesError ? (
            <ErrorState message={responseTimesError} />
          ) : responseTimes.length === 0 ? (
            <EmptyState
              title="No response time data"
              description="Response time points will appear once checks start running."
              icon="📈"
            />
          ) : (
            <ResponseTimeChart data={responseTimes} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Recent Checks</h2>
        </CardHeader>
        <CardBody>
          {isLoadingChecks ? (
            <LoadingState />
          ) : checksError ? (
            <ErrorState message={checksError} />
          ) : checks.length === 0 ? (
            <EmptyState
              title="No checks yet"
              description="Checks will appear once monitoring starts."
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
          {isLoadingIncidents ? (
            <LoadingState />
          ) : incidentsError ? (
            <ErrorState message={incidentsError} />
          ) : incidents.length === 0 ? (
            <EmptyState
              title="No incidents"
              description="This website has no recorded incidents yet."
              icon="✅"
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
          {isLoadingNotifications ? (
            <LoadingState />
          ) : notificationsError ? (
            <ErrorState message={notificationsError} />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="No alerts have been sent for this website yet."
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