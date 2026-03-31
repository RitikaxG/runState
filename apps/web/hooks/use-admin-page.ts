'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminAPI, APIError } from '../lib/api'
import { parseErrorMessage } from '../lib/utils'
import { useAuthStore } from '../stores/auth-store'
import { useUIStore } from '../stores/ui-store'
import { useWebsitesStore } from '../stores/website-store'
import type { AdminUserDTO } from '../types/api'

const ADMIN_POLL_INTERVAL_MS = 15000

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message
  return fallback
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

export function useAdminPage() {
  const { showToast } = useUIStore()

  const {
    websites,
    isLoadingWebsites,
    websitesError,
    fetchWebsites,
    deleteWebsite,
  } = useWebsitesStore()

  const [users, setUsers] = useState<AdminUserDTO[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true)
      setUsersError(null)

      const response = await withAuthRetry((token) => adminAPI.getUsers(token))

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch admin users')
      }

      setUsers(response.data)
      setIsLoadingUsers(false)
      setUsersError(null)
    } catch (err) {
      setUsers([])
      setIsLoadingUsers(false)
      setUsersError(getErrorMessage(err, 'Failed to fetch admin users'))
    }
  }, [])

  const handleDeleteWebsite = useCallback(
    async (websiteId: string) => {
      try {
        await deleteWebsite(websiteId)
        showToast('Website deleted successfully', 'success')
        await fetchWebsites()
      } catch (err) {
        showToast(parseErrorMessage(err), 'error')
        throw err
      }
    },
    [deleteWebsite, fetchWebsites, showToast]
  )

  useEffect(() => {
    void fetchUsers()
    void fetchWebsites()

    const intervalId = window.setInterval(() => {
      void fetchUsers()
      void fetchWebsites()
    }, ADMIN_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fetchUsers, fetchWebsites])

  const totalUsers = users.length
  const totalMonitors = websites.length
  const upCount = websites.filter((website) => website.currentStatus === 'up').length
  const downCount = websites.filter((website) => website.currentStatus === 'down').length

  return {
    users,
    websites,
    isLoadingUsers,
    isLoadingWebsites,
    usersError,
    websitesError,
    totalUsers,
    totalMonitors,
    upCount,
    downCount,
    handleDeleteWebsite,
  }
}