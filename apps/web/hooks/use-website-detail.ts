'use client'

import { useEffect } from 'react'
import { useWebsitesStore } from '../stores/website-store'

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
    fetchWebsiteDetail,
    fetchChecks,
    fetchResponseTimes,
    fetchIncidents,
    fetchNotifications,
  } = useWebsitesStore()

  useEffect(() => {
    if (!websiteId) return

    fetchWebsiteDetail(websiteId)
    fetchChecks(websiteId)
    fetchResponseTimes(websiteId)
    fetchIncidents(websiteId)
    fetchNotifications(websiteId)
  }, [
    websiteId,
    fetchWebsiteDetail,
    fetchChecks,
    fetchResponseTimes,
    fetchIncidents,
    fetchNotifications,
  ])

  const isLoading =
    isLoadingDetail ||
    isLoadingChecks ||
    isLoadingResponseTimes ||
    isLoadingIncidents ||
    isLoadingNotifications

  return {
    website: selectedWebsite,
    checks,
    responseTimes,
    incidents,
    notifications,
    isLoading,
    error: detailError,
  }
}