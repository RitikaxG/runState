import type {
  WebsiteListItemDTO,
  WebsiteDetailDTO,
  WebsiteCheckItemDTO,
  ResponseTimePointDTO,
  IncidentResponseDTO,
  NotificationLogResponseDTO,
  PublicStatusWebsiteItemDTO,
  IncidentSummaryDTO,
} from '../types/api'

import type {
  Website,
  WebsiteDetail,
  Check,
  ResponseTime,
  Incident,
  Notification,
} from '../types/website'

import type { WebsiteStatus } from '../types/common'

export type PublicStatusWebsite = {
  id: string
  url: string
  currentStatus: WebsiteStatus
}

export function mapIncidentSummaryDTO(dto: IncidentSummaryDTO) {
  return {
    id: dto.id,
    websiteId: dto.website_id,
    regionId: dto.region_id,
    startedAt: dto.started_at,
    resolvedAt: dto.resolved_at,
    isActive: dto.is_active,
    currentStatus: dto.current_status,
    durationSeconds: dto.duration_seconds,
  }
}

export function mapWebsiteListItemDTO(dto: WebsiteListItemDTO): Website {
  return {
    id: dto.id,
    url: dto.url,
    currentStatus: dto.current_status,
    timeAdded: dto.time_added,
    lastCheckedAt: dto.last_checked_at,
    latestResponseTimeMs: dto.latest_response_time_ms,
  }
}

export function mapWebsiteDetailDTO(dto: WebsiteDetailDTO): WebsiteDetail {
  return {
    id: dto.id,
    url: dto.url,
    currentStatus: dto.current_status,
    timeAdded: dto.time_added,
    lastCheckedAt: dto.last_checked_at,
    latestResponseTimeMs: dto.latest_response_time_ms,
    activeIncident: dto.active_incident
      ? mapIncidentSummaryDTO(dto.active_incident)
      : null,
  }
}

export function mapCheckDTO(dto: WebsiteCheckItemDTO): Check {
  return {
    id: dto.id,
    websiteId: dto.website_id,
    regionId: dto.region_id,
    status: dto.status,
    responseTimeMs: dto.response_time_ms,
    createdAt: dto.created_at,
    regionName: dto.region_name,
  }
}

export function mapResponseTimeDTO(dto: ResponseTimePointDTO): ResponseTime {
  return {
    timestamp: dto.timestamp,
    responseTimeMs: dto.response_time_ms,
    status: dto.status,
    regionId: dto.region_id,
    regionName: dto.region_name,
  }
}

export function mapIncidentDTO(dto: IncidentResponseDTO): Incident {
  return {
    id: dto.id,
    websiteId: dto.website_id,
    regionId: dto.region_id,
    startedAt: dto.started_at,
    resolvedAt: dto.resolved_at,
    isActive: dto.is_active,
    currentStatus: dto.current_status,
    durationSeconds: dto.duration_seconds,
  }
}

export function mapNotificationDTO(dto: NotificationLogResponseDTO): Notification {
  return {
    id: dto.id,
    channel: dto.channel,
    recipient: dto.recipient,
    prevStatus: dto.prev_status,
    currentStatus: dto.current_status,
    deliveryStatus: dto.delivery_status,
    sentAt: dto.sent_at,
    regionId: dto.region_id,
  }
}

export function mapPublicStatusWebsiteDTO(
  dto: PublicStatusWebsiteItemDTO
): PublicStatusWebsite {
  return {
    id: dto.id,
    url: dto.url,
    currentStatus: dto.current_status,
  }
}