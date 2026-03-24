import { getStatusColor } from '../../lib/utils'
import { WebsiteStatus } from '../../types/common'

interface StatusBadgeProps {
  status: WebsiteStatus | null
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const label = {
    up: '✓ Up',
    down: '✗ Down',
    unknown: '? Unknown',
  }[status || 'unknown'] || status

  return (
    <span className={`${getStatusColor(status)} rounded-full font-semibold ${sizeClasses[size]}`}>
      {label}
    </span>
  )
}