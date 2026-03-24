'use client'

import { useDashboard } from '../../hooks/use-dashboard'
import { Card, CardHeader, CardBody } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { LoadingState } from '../../components/common/loading-state'
import { ErrorState } from '../../components/common/error-state'
import { EmptyState } from '../../components/common/empty-state'
import { WebsitesTable } from '../../components/website/website-table'
import { AddWebsiteForm } from '../../components/website/add-website-form'
import { Modal } from '../../components/common/model'
import { SummaryCard } from '../../components/status/summary-card'

export default function DashboardPage() {
  const {
    websites,
    isLoadingWebsites,
    websitesError,
    addWebsiteModalOpen,
    setAddWebsiteModalOpen,
    handleAddWebsite,
    handleDeleteWebsite,
  } = useDashboard()

  const upCount = websites.filter((website) => website.currentStatus === 'up').length
  const downCount = websites.filter((website) => website.currentStatus === 'down').length

  if (isLoadingWebsites) {
    return <LoadingState />
  }

  if (websitesError) {
    return (
      <ErrorState
        message={websitesError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-4xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Websites"
            value={websites.length}
            icon="🌐"
          />
          <SummaryCard
            title="Operational"
            value={upCount}
            subtitle="Websites up"
            icon="✓"
          />
          <SummaryCard
            title="Down"
            value={downCount}
            subtitle="Websites down"
            icon="✗"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Monitored Websites</h2>

          <Button
            onClick={() => setAddWebsiteModalOpen(true)}
            variant="primary"
          >
            + Add Website
          </Button>
        </CardHeader>

        <CardBody>
          {websites.length === 0 ? (
            <EmptyState
              title="No websites yet"
              description="Add your first website to start monitoring"
              icon="🚀"
            />
          ) : (
            <WebsitesTable
              websites={websites}
              onDelete={handleDeleteWebsite}
            />
          )}
        </CardBody>
      </Card>

      <Modal
        open={addWebsiteModalOpen}
        onClose={() => setAddWebsiteModalOpen(false)}
        title="Add Website"
      >
        <AddWebsiteForm onSubmit={handleAddWebsite} />
      </Modal>
    </div>
  )
}