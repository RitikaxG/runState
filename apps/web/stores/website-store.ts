'use client'

import { create } from 'zustand'
import { websiteAPI, APIError } from '../lib/api'
import { useAuthStore } from './auth-store'
import {
  mapWebsiteListItemDTO,
  mapWebsiteDetailDTO,
  mapCheckDTO,
  mapResponseTimeDTO,
  mapIncidentDTO,
  mapNotificationDTO,
} from '../lib/mappers'
import type {
  Website,
  WebsiteDetail,
  Check,
  ResponseTime,
  Incident,
  Notification,
} from '../types/website'

interface WebsitesStore {
  websites: Website[]
  selectedWebsiteId: string | null
  isLoadingWebsites: boolean
  websitesError: string | null

  selectedWebsite: WebsiteDetail | null
  isLoadingDetail: boolean
  detailError: string | null

  checks: Check[]
  isLoadingChecks: boolean
  checksError: string | null

  responseTimes: ResponseTime[]
  isLoadingResponseTimes: boolean
  responseTimesError: string | null

  incidents: Incident[]
  isLoadingIncidents: boolean
  incidentsError: string | null

  notifications: Notification[]
  isLoadingNotifications: boolean
  notificationsError: string | null

  fetchWebsites: () => Promise<void>
  createWebsite: (url: string) => Promise<void>
  deleteWebsite: (id: string) => Promise<void>
  selectWebsite: (id: string) => void
  fetchWebsiteDetail: (id: string) => Promise<void>
  fetchChecks: (websiteId: string) => Promise<void>
  fetchResponseTimes: (websiteId: string) => Promise<void>
  fetchIncidents: (websiteId: string) => Promise<void>
  fetchNotifications: (websiteId: string) => Promise<void>
  clearSelection: () => void
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

async function getValidAccessToken(): Promise<string> {
  const auth = useAuthStore.getState()

  if (auth.accessToken) return auth.accessToken

  if (auth.refreshToken) {
    const ok = await auth.refreshAccessToken()
    const nextToken = useAuthStore.getState().accessToken

    if (ok && nextToken) return nextToken
  }

  throw new Error('Session expired. Please sign in again.')
}

async function withAuthRetry<T>(fn: (token: string) => Promise<T>): Promise<T> {
  try {
    const token = await getValidAccessToken()
    return await fn(token)
  } catch (err) {
    if (err instanceof APIError && err.status === 401) {
      const ok = await useAuthStore.getState().refreshAccessToken()
      const nextToken = useAuthStore.getState().accessToken

      if (ok && nextToken) {
        return await fn(nextToken)
      }
    }

    throw err
  }
}

export const useWebsitesStore = create<WebsitesStore>((set, get) => ({
  websites: [],
  selectedWebsiteId: null,
  isLoadingWebsites: false,
  websitesError: null,

  selectedWebsite: null,
  isLoadingDetail: false,
  detailError: null,

  checks: [],
  isLoadingChecks: false,
  checksError: null,

  responseTimes: [],
  isLoadingResponseTimes: false,
  responseTimesError: null,

  incidents: [],
  isLoadingIncidents: false,
  incidentsError: null,

  notifications: [],
  isLoadingNotifications: false,
  notificationsError: null,

  fetchWebsites: async () => {
    try {
      set({ isLoadingWebsites: true, websitesError: null })

      const response = await withAuthRetry((token) => websiteAPI.getAll(token))

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch websites')
      }

      const websites = response.data.websites.map(mapWebsiteListItemDTO)

      set({
        websites,
        isLoadingWebsites: false,
        websitesError: null,
      })
    } catch (err) {
      set({
        websites: [],
        websitesError: getErrorMessage(err, 'Failed to fetch websites'),
        isLoadingWebsites: false,
      })
    }
  },

  createWebsite: async (url: string) => {
    try {
      set({ isLoadingWebsites: true, websitesError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.create(url, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to create website')
      }

      await get().fetchWebsites()
    } catch (err) {
      set({
        websitesError: getErrorMessage(err, 'Failed to create website'),
        isLoadingWebsites: false,
      })
      throw err
    }
  },

  deleteWebsite: async (id: string) => {
    try {
      const response = await withAuthRetry((token) =>
        websiteAPI.delete(id, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete website')
      }

      set((state) => ({
        websites: state.websites.filter((w) => w.id !== id),
        selectedWebsiteId:
          state.selectedWebsiteId === id ? null : state.selectedWebsiteId,
        selectedWebsite:
          state.selectedWebsite?.id === id ? null : state.selectedWebsite,
      }))
    } catch (err) {
      set({
        websitesError: getErrorMessage(err, 'Failed to delete website'),
      })
      throw err
    }
  },

  selectWebsite: (id: string) => {
    set({ selectedWebsiteId: id })
  },

  fetchWebsiteDetail: async (id: string) => {
    try {
      set({ isLoadingDetail: true, detailError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.getById(id, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch website detail')
      }

      const selectedWebsite = mapWebsiteDetailDTO(response.data.website)

      set({
        selectedWebsite,
        isLoadingDetail: false,
        detailError: null,
      })
    } catch (err) {
      set({
        selectedWebsite: null,
        detailError: getErrorMessage(err, 'Failed to fetch website detail'),
        isLoadingDetail: false,
      })
    }
  },

  fetchChecks: async (websiteId: string) => {
    try {
      set({ isLoadingChecks: true, checksError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.getChecks(websiteId, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch checks')
      }

      const checks = response.data.checks.map(mapCheckDTO)

      set({
        checks,
        isLoadingChecks: false,
        checksError: null,
      })
    } catch (err) {
      set({
        checks: [],
        checksError: getErrorMessage(err, 'Failed to fetch checks'),
        isLoadingChecks: false,
      })
    }
  },

  fetchResponseTimes: async (websiteId: string) => {
    try {
      set({ isLoadingResponseTimes: true, responseTimesError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.getResponseTimes(websiteId, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch response times')
      }

      const responseTimes = response.data.points.map(mapResponseTimeDTO)

      set({
        responseTimes,
        isLoadingResponseTimes: false,
        responseTimesError: null,
      })
    } catch (err) {
      set({
        responseTimes: [],
        responseTimesError: getErrorMessage(err, 'Failed to fetch response times'),
        isLoadingResponseTimes: false,
      })
    }
  },

  fetchIncidents: async (websiteId: string) => {
    try {
      set({ isLoadingIncidents: true, incidentsError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.getIncidents(websiteId, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch incidents')
      }

      const incidents = response.data.incidents.map(mapIncidentDTO)

      set({
        incidents,
        isLoadingIncidents: false,
        incidentsError: null,
      })
    } catch (err) {
      set({
        incidents: [],
        incidentsError: getErrorMessage(err, 'Failed to fetch incidents'),
        isLoadingIncidents: false,
      })
    }
  },

  fetchNotifications: async (websiteId: string) => {
    try {
      set({ isLoadingNotifications: true, notificationsError: null })

      const response = await withAuthRetry((token) =>
        websiteAPI.getNotifications(websiteId, token)
      )

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch notifications')
      }

      const notifications = response.data.items.map(mapNotificationDTO)

      set({
        notifications,
        isLoadingNotifications: false,
        notificationsError: null,
      })
    } catch (err) {
      set({
        notifications: [],
        notificationsError: getErrorMessage(err, 'Failed to fetch notifications'),
        isLoadingNotifications: false,
      })
    }
  },

  clearSelection: () => {
    set({
      selectedWebsiteId: null,
      selectedWebsite: null,
      checks: [],
      responseTimes: [],
      incidents: [],
      notifications: [],
      isLoadingDetail: false,
      isLoadingChecks: false,
      isLoadingResponseTimes: false,
      isLoadingIncidents: false,
      isLoadingNotifications: false,
      detailError: null,
      checksError: null,
      responseTimesError: null,
      incidentsError: null,
      notificationsError: null,
    })
  },
}))