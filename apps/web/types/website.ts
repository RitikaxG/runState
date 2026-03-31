import type { WebsiteStatus } from './common'

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | string

export type Website = {
  id: string
  url: string
  currentStatus: WebsiteStatus | null
  timeAdded: string
  lastCheckedAt: string | null
  latestResponseTimeMs: number | null
}

export type Incident = {
  id: string
  websiteId: string
  regionId: string | null
  regionName: string | null
  startedAt: string
  resolvedAt: string | null
  isActive: boolean
  currentStatus: WebsiteStatus
  durationSeconds: number
}

export type WebsiteDetail = {
  id: string
  url: string
  currentStatus: WebsiteStatus | null
  timeAdded: string
  lastCheckedAt: string | null
  latestResponseTimeMs: number | null
  activeIncident: Incident | null
}

export type Check = {
  id: string
  websiteId: string
  regionId: string
  status: WebsiteStatus
  responseTimeMs: number | null
  createdAt: string
  regionName: string | null
}

export type ResponseTime = {
  timestamp: string
  responseTimeMs: number | null
  status: WebsiteStatus
  regionId: string
  regionName: string | null
}

export type Notification = {
  id: string
  channel: string
  recipient: string
  prevStatus: WebsiteStatus
  currentStatus: WebsiteStatus
  deliveryStatus: DeliveryStatus
  sentAt: string
  regionId: string | null
}