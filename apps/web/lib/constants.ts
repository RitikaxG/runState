export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const STORAGE_KEYS = {
  AUTH_STORE: 'auth-store',
  ACCESS_TOKEN: 'runstate_access_token',
  REFRESH_TOKEN: 'runstate_refresh_token',
  USER: 'runstate_user',
} as const

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const

export const API_LIMITS = {
  CHECKS_DEFAULT: 20,
  CHECKS_MAX: 100,
  RESPONSE_TIMES_DEFAULT: 50,
  RESPONSE_TIMES_MAX: 500,
  INCIDENTS_DEFAULT: 20,
  INCIDENTS_MAX: 100,
  NOTIFICATIONS_DEFAULT: 20,
  NOTIFICATIONS_MAX: 100,
} as const

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  DASHBOARD: '/dashboard',
  WEBSITE_DETAIL: (id: string) => `/dashboard/websites/${id}`,
  STATUS_PAGE: (slug: string) => `/status/${slug}`,
} as const