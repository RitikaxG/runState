import type {
  SignupResponse,
  SigninResponse,
  MeResponse,
  LogoutResponse,
  GetWebsitesResponse,
  CreateWebsiteResponse,
  GetWebsiteDetailResponse,
  GetWebsiteChecksResponse,
  GetWebsiteResponseTimesResponse,
  GetWebsiteIncidentsResponse,
  GetWebsiteNotificationsResponse,
  GetPublicStatusPageResponse,
  APIResponse,
} from '../types/api'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'

export class APIError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.body = body
  }
}

function buildHeaders(
  optionsHeaders?: HeadersInit,
  token?: string,
  hasBody?: boolean
): Record<string, string> {
  const headers: Record<string, string> = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  }

  if (optionsHeaders instanceof Headers) {
    optionsHeaders.forEach((value, key) => {
      headers[key] = value
    })
  } else if (Array.isArray(optionsHeaders)) {
    for (const [key, value] of optionsHeaders) {
      headers[key] = value
    }
  } else if (optionsHeaders) {
    Object.assign(headers, optionsHeaders as Record<string, string>)
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || ''

  if (response.status === 204) return null

  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    return await response.text()
  } catch {
    return null
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const hasBody = options.body !== undefined && options.body !== null
  const headers = buildHeaders(options.headers, token, hasBody)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `API Error: ${response.status}`

    throw new APIError(response.status, data, message)
  }

  return data as T
}

// auth
export const authAPI = {
  signup: (email: string, password: string) =>
    makeRequest<SignupResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signin: (email: string, password: string) =>
    makeRequest<SigninResponse>('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    makeRequest<MeResponse>('/me', { method: 'GET' }, token),

  refreshToken: (refreshToken: string) =>
    makeRequest<SigninResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken: string) =>
    makeRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
}

// websites
export const websiteAPI = {
  getAll: (token: string) =>
    makeRequest<GetWebsitesResponse>('/websites', { method: 'GET' }, token),

  create: (url: string, token: string) =>
    makeRequest<CreateWebsiteResponse>(
      '/websites',
      {
        method: 'POST',
        body: JSON.stringify({ url }),
      },
      token
    ),

  getById: (id: string, token: string) =>
    makeRequest<GetWebsiteDetailResponse>(
      `/websites/${id}`,
      { method: 'GET' },
      token
    ),

  delete: (id: string, token: string) =>
    makeRequest<APIResponse<null>>(
      `/websites/${id}`,
      { method: 'DELETE' },
      token
    ),

  getChecks: (websiteId: string, token: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) })
    return makeRequest<GetWebsiteChecksResponse>(
      `/websites/${websiteId}/checks?${params.toString()}`,
      { method: 'GET' },
      token
    )
  },

  getResponseTimes: (websiteId: string, token: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) })
    return makeRequest<GetWebsiteResponseTimesResponse>(
      `/websites/${websiteId}/response-times?${params.toString()}`,
      { method: 'GET' },
      token
    )
  },

  getIncidents: (websiteId: string, token: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) })
    return makeRequest<GetWebsiteIncidentsResponse>(
      `/websites/${websiteId}/incidents?${params.toString()}`,
      { method: 'GET' },
      token
    )
  },

  getNotifications: (websiteId: string, token: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) })
    return makeRequest<GetWebsiteNotificationsResponse>(
      `/websites/${websiteId}/notifications?${params.toString()}`,
      { method: 'GET' },
      token
    )
  },
}

// public
export const publicAPI = {
  getStatusPage: (slug: string) =>
    makeRequest<GetPublicStatusPageResponse>(
      `/public/status-pages/${slug}`,
      { method: 'GET' }
    ),
}