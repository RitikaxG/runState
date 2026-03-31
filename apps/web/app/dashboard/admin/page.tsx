'use client'

import { Card, CardBody, CardHeader } from '../../../components/common/card'
import { ErrorState } from '../../../components/common/error-state'
import { LoadingState } from '../../../components/common/loading-state'
import { SummaryCard } from '../../../components/status/summary-card'
import { AdminUsersTable } from '../../../components/admin/admin-users-table'
import { WebsitesTable } from '../../../components/website/website-table'
import { useAdminPage } from '../../../hooks/use-admin-page'

export default function AdminDashboardPage() {
  const {
    users,
    websites,
    isLoadingUsers,
    isLoadingWebsites,
    usersError,
    websitesError,
    totalUsers,
    totalMonitors,
    upCount,
    downCount,
    handleDeleteWebsite,
  } = useAdminPage()

  if (isLoadingUsers && isLoadingWebsites) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Global system view for administrators across users and monitors.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={totalUsers}
          subtitle="Registered accounts"
          icon="👤"
        />
        <SummaryCard
          title="Total Monitors"
          value={totalMonitors}
          subtitle="Across all users"
          icon="🌐"
        />
        <SummaryCard
          title="Operational"
          value={upCount}
          subtitle="Monitors up"
          icon="✓"
        />
        <SummaryCard
          title="Down"
          value={downCount}
          subtitle="Monitors down"
          icon="✗"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="mt-1 text-sm text-gray-500">
              Admin-only view of registered accounts and roles.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          {isLoadingUsers ? (
            <LoadingState />
          ) : usersError ? (
            <ErrorState
              message={usersError}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <AdminUsersTable users={users} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Monitors</h2>
            <p className="mt-1 text-sm text-gray-500">
              Global monitor inventory visible only to administrators.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          {isLoadingWebsites ? (
            <LoadingState />
          ) : websitesError ? (
            <ErrorState
              message={websitesError}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <WebsitesTable
              websites={websites}
              onDelete={handleDeleteWebsite}
            />
          )}
        </CardBody>
      </Card>
    </div>
  )
}