import type { UserRole, WebsiteStatus } from './common'

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  message?: string
}

export type ApiErrorResponse = {
  success: false
  error: string
  message?: string
}

export type APIResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type NotificationChannel = 'email' | 'webhook' | 'sms' | string
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | string

export type SignupResponseData = {
  id: string
  email: string
  role: UserRole
}

export type SignupResponse = APIResponse<SignupResponseData>

export type SigninResponseData = {
  access_token: string
  refresh_token: string
}

export type SigninResponse = APIResponse<SigninResponseData>

export type MeResponseData = {
  id: string
  email: string
  role: UserRole
}

export type MeResponse = APIResponse<MeResponseData>

export type LogoutResponse = APIResponse<null>

export type WebsiteListItemDTO = {
  id: string
  url: string
  current_status: WebsiteStatus | null
  time_added: string
  last_checked_at: string | null
  latest_response_time_ms: number | null
}

export type IncidentSummaryDTO = {
  id: string
  website_id: string
  region_id: string | null
  region_name: string | null
  started_at: string
  resolved_at: string | null
  is_active: boolean
  current_status: WebsiteStatus
  duration_seconds: number
}

export type WebsiteDetailDTO = {
  id: string
  url: string
  current_status: WebsiteStatus | null
  time_added: string
  last_checked_at: string | null
  latest_response_time_ms: number | null
  active_incident: IncidentSummaryDTO | null
}

export type GetWebsitesResponse = APIResponse<{
  websites: WebsiteListItemDTO[]
}>

export type CreateWebsiteResponse = APIResponse<{
  website: WebsiteListItemDTO
}>

export type GetWebsiteDetailResponse = APIResponse<{
  website: WebsiteDetailDTO
}>

export type WebsiteCheckItemDTO = {
  id: string
  website_id: string
  region_id: string
  status: WebsiteStatus
  response_time_ms: number | null
  created_at: string
  region_name: string | null
}

export type ResponseTimePointDTO = {
  timestamp: string
  response_time_ms: number | null
  status: WebsiteStatus
  region_id: string
  region_name: string | null
}

export type GetWebsiteChecksResponse = APIResponse<{
  checks: WebsiteCheckItemDTO[]
}>

export type GetWebsiteResponseTimesResponse = APIResponse<{
  points: ResponseTimePointDTO[]
}>

export type IncidentResponseDTO = {
  id: string
  website_id: string
  region_id: string | null
  region_name: string | null
  started_at: string
  resolved_at: string | null
  is_active: boolean
  current_status: WebsiteStatus
  duration_seconds: number
}

export type GetWebsiteIncidentsResponse = APIResponse<{
  incidents: IncidentResponseDTO[]
}>

export type NotificationLogResponseDTO = {
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
  items: NotificationLogResponseDTO[]
}>

export type PublicStatusWebsiteItemDTO = {
  id: string
  url: string
  current_status: WebsiteStatus
}

export type GetPublicStatusPageResponse = APIResponse<{
  websites: PublicStatusWebsiteItemDTO[]
}>

export type AdminUserDTO = {
  id: string
  email: string
  role: UserRole
}

export type GetAdminUsersResponse = APIResponse<AdminUserDTO[]>