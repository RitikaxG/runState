import type { Notification } from '../../types/website'
import { formatDateTime } from '../../lib/utils'
import { Card, CardBody } from '../common/card'

interface NotificationsListProps {
  notifications: Notification[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const deliveryStatusIcon: Record<string, string> = {
    sent: '✓',
    failed: '✗',
    pending: '⏳',
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500">No notifications sent yet.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notif) => (
        <Card key={notif.id}>
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {notif.channel.toUpperCase()} to {notif.recipient}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {notif.prevStatus} → {notif.currentStatus}
                </p>

                <p className="text-sm text-gray-600">
                  Sent: {formatDateTime(notif.sentAt)}
                </p>

                {notif.regionId && (
                  <p className="text-sm text-gray-600">
                    Region: {notif.regionId}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {deliveryStatusIcon[notif.deliveryStatus] ?? '•'}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {notif.deliveryStatus}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}