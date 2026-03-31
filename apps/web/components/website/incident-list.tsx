import type { Incident } from '../../types/website'
import { StatusBadge } from '../status/status-badge'
import { formatDateTime } from '../../lib/utils'
import { formatDuration } from '../../lib/format'
import { Card, CardBody } from '../common/card'

interface IncidentsListProps {
  incidents: Incident[]
}

export function IncidentsList({ incidents }: IncidentsListProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500">No incidents recorded yet.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <StatusBadge status={incident.currentStatus} size="sm" />
                  <span className="text-sm font-semibold text-gray-900">
                    {incident.isActive ? '🔴 Active Incident' : '✓ Resolved'}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Started: {formatDateTime(incident.startedAt)}
                </p>

                {incident.resolvedAt && (
                  <p className="text-sm text-gray-600">
                    Resolved: {formatDateTime(incident.resolvedAt)}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Duration: {formatDuration(incident.durationSeconds)}
                </p>

                {(incident.regionName || incident.regionId) && (
                  <p className="text-sm text-gray-600">
                    Region: {incident.regionName ?? incident.regionId}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}