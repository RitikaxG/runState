'use client'

import { useEffect } from 'react'
import { useWebsitesStore } from '../stores/website-store'

const WEBSITE_DETAIL_POLL_INTERVAL_MS = 15000

export function useWebsiteDetail(websiteId: string) {
  const {
    selectedWebsite,
    checks,
    responseTimes,
    incidents,
    notifications,
    isLoadingDetail,
    isLoadingChecks,
    isLoadingResponseTimes,
    isLoadingIncidents,
    isLoadingNotifications,
    detailError,
    checksError,
    responseTimesError,
    incidentsError,
    notificationsError,
    fetchWebsiteDetail,
    fetchChecks,
    fetchResponseTimes,
    fetchIncidents,
    fetchNotifications,
    clearSelection,
  } = useWebsitesStore()

  useEffect(() => {
    if (!websiteId) {
      clearSelection()
      return
    }

    const loadAll = async () => {
      await Promise.all([
        fetchWebsiteDetail(websiteId),
        fetchChecks(websiteId),
        fetchResponseTimes(websiteId),
        fetchIncidents(websiteId),
        fetchNotifications(websiteId),
      ])
    }

    void loadAll()

    const intervalId = window.setInterval(() => {
      void loadAll()
    }, WEBSITE_DETAIL_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      clearSelection()
    }
  }, [
    websiteId,
    fetchWebsiteDetail,
    fetchChecks,
    fetchResponseTimes,
    fetchIncidents,
    fetchNotifications,
    clearSelection,
  ])

  return {
    website: selectedWebsite,
    checks,
    responseTimes,
    incidents,
    notifications,
    isLoadingDetail,
    isLoadingChecks,
    isLoadingResponseTimes,
    isLoadingIncidents,
    isLoadingNotifications,
    detailError,
    checksError,
    responseTimesError,
    incidentsError,
    notificationsError,
  }
}