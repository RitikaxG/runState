import type { WebsiteStatus } from "../types/common"

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid time'
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function getStatusColor(status: WebsiteStatus | null): string {
  switch (status) {
    case 'up':
      return 'bg-green-100 text-green-800'
    case 'down':
      return 'bg-red-100 text-red-800'
    case 'unknown':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusBadgeColor(status: WebsiteStatus | null): string {
  switch (status) {
    case 'up':
      return 'bg-green-500'
    case 'down':
      return 'bg-red-500'
    case 'unknown':
    default:
      return 'bg-gray-400'
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function formatResponseTime(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value} ms`
}

export function parseErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error?: unknown }).error === 'string'
  ) {
    return (error as { error: string }).error
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An error occurred'
}