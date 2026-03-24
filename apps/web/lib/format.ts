import type { WebsiteStatus } from "../types/common"

export function formatUptime(percentage: number): string {
  if (!Number.isFinite(percentage)) return 'N/A'
  return `${percentage.toFixed(2)}%`
}

export function formatResponseTime(ms: number | null | undefined): string {
  if (ms == null) return 'N/A'
  return `${ms} ms`
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return 'N/A'

  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

export function getStatusLabel(status: WebsiteStatus | null): string {
  switch (status) {
    case 'up':
      return 'Operational'
    case 'down':
      return 'Down'
    case 'unknown':
    default:
      return 'Unknown'
  }
}