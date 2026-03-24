import type { UserRole, WebsiteStatus } from './common'

// =====================
// API-ONLY SHARED TYPES
// =====================

export type NotificationChannel = 'email' | 'webhook' | 'sms' | string
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | string

// Common response wrapper used by most endpoints
export type APIResponse<T> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// ============ AUTH TYPES ============

export type SignupRequest = {
  email: string
  password: string
}

export type SignupResponse = {
  id: string
  email: string
  role: UserRole
}

export type SigninRequest = {
  email: string
  password: string
}

export type SigninResponse = {
  access_token: string
  refresh_token: string
}

export type MeResponse = {
  id: string
  email: string
  role: UserRole
}

export type RefreshTokenRequest = {
  refresh_token: string
}

export type LogoutRequest = {
  refresh_token: string
}

// ============ WEBSITE TYPES ============

export type WebsiteListItem = {
  id: string
  url: string
  current_status: WebsiteStatus | null
  time_added: string
  last_checked_at: string | null
  latest_response_time_ms: number | null
}

export type GetWebsitesResponse = APIResponse<{
  websites: WebsiteListItem[]
}>

export type CreateWebsiteRequest = {
  url: string
}

export type CreateWebsiteResponse = APIResponse<{
  website: WebsiteListItem
}>

export type IncidentSummary = {
  id: string
  website_id: string
  region_id?: string | null
  started_at: string
  resolved_at?: string | null
  is_active: boolean
  current_status: WebsiteStatus
  duration_seconds: number
}

export type WebsiteDetail = {
  id: string
  url: string
  current_status: WebsiteStatus | null
  time_added: string
  last_checked_at: string | null
  latest_response_time_ms: number | null
  active_incident: IncidentSummary | null
}

export type GetWebsiteDetailResponse = APIResponse<{
  website: WebsiteDetail
}>

// ============ MONITORING TYPES ============

export type WebsiteCheckItem = {
  id: string
  website_id: string
  region_id: string
  status: WebsiteStatus
  response_time_ms: number | null
  created_at: string
  region_name?: string | null
}

export type GetWebsiteChecksResponse = APIResponse<{
  checks: WebsiteCheckItem[]
}>

export type ResponseTimePoint = {
  timestamp: string
  response_time_ms: number | null
  status: WebsiteStatus
  region_id: string
  region_name?: string | null
}

export type GetWebsiteResponseTimesResponse = APIResponse<{
  points: ResponseTimePoint[]
}>

// ============ INCIDENT TYPES ============

export type IncidentResponse = {
  id: string
  website_id: string
  region_id?: string | null
  started_at: string
  resolved_at?: string | null
  is_active: boolean
  current_status: WebsiteStatus
  duration_seconds: number
}

export type GetWebsiteIncidentsResponse = APIResponse<{
  incidents: IncidentResponse[]
}>

// ============ NOTIFICATION TYPES ============

export type NotificationLogResponse = {
  id: string
  channel: NotificationChannel
  recipient: string
  prev_status: WebsiteStatus
  current_status: WebsiteStatus
  delivery_status: DeliveryStatus
  sent_at: string
  region_id: string | null
}

export type GetWebsiteNotificationsResponse = APIResponse<{
  items: NotificationLogResponse[]
}>