'use client'

import { useParams, useRouter } from 'next/navigation'
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

export default function WebsiteDetailPage() {
  const router = useRouter()
  const params = useParams()

  const websiteId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : ''

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
  } = useWebsiteDetail(websiteId)

  if (!websiteId) {
    return (
      <ErrorState
        message="Website id is missing from the route."
        onRetry={() => router.push(ROUTES.DASHBOARD)}
      />
    )
  }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {website.url}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Added: {formatDateTime(website.timeAdded)}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.DASHBOARD)}
        >
          ← Back
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-600">Current Status</h3>
          </CardHeader>
          <CardBody>
            <StatusBadge status={website.currentStatus} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-600">Last Checked</h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-700">
              {website.lastCheckedAt
                ? formatDateTime(website.lastCheckedAt)
                : 'Never'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-600">
              Latest Response Time
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-700">
              {website.latestResponseTimeMs != null
                ? formatResponseTime(website.latestResponseTimeMs)
                : '—'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-600">
              Incident Status
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                {website.activeIncident?.isActive
                  ? 'Active Incident'
                  : 'No Active Incident'}
              </p>

              {website.activeIncident?.isActive && (
                <p className="text-xs text-slate-500">
                  Started {formatDateTime(website.activeIncident.startedAt)}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium text-slate-600">Monitor Created</h3>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-700">
            {formatDateTime(website.timeAdded)}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Response Time</h3>
        </CardHeader>
        <CardBody>
          {isLoadingResponseTimes ? (
            <LoadingState />
          ) : responseTimesError ? (
            <ErrorState message={responseTimesError} />
          ) : responseTimes.length === 0 ? (
            <EmptyState
              title="No response time data yet"
              description="Response time metrics will appear after monitoring checks run."
            />
          ) : (
            <ResponseTimeChart data={responseTimes} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Recent Checks</h3>
        </CardHeader>
        <CardBody>
          {isLoadingChecks ? (
            <LoadingState />
          ) : checksError ? (
            <ErrorState message={checksError} />
          ) : checks.length === 0 ? (
            <EmptyState
              title="No checks yet"
              description="Recent monitoring checks will appear here."
            />
          ) : (
            <ChecksTable checks={checks} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Incidents</h3>
        </CardHeader>
        <CardBody>
          {isLoadingIncidents ? (
            <LoadingState />
          ) : incidentsError ? (
            <ErrorState message={incidentsError} />
          ) : incidents.length === 0 ? (
            <EmptyState
              title="No incidents"
              description="Incident history will appear here when downtime is detected."
            />
          ) : (
            <IncidentsList incidents={incidents} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        </CardHeader>
        <CardBody>
          {isLoadingNotifications ? (
            <LoadingState />
          ) : notificationsError ? (
            <ErrorState message={notificationsError} />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Sent notification history will appear here."
            />
          ) : (
            <NotificationsList notifications={notifications} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}