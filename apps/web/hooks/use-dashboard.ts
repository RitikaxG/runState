'use client'

import { useEffect } from 'react'
import { useWebsitesStore } from '../stores/website-store'
import { useUIStore } from '../stores/ui-store'
import { parseErrorMessage } from '../lib/utils'

const DASHBOARD_POLL_INTERVAL_MS = 15000

export function useDashboard() {
  const {
    websites,
    isLoadingWebsites,
    websitesError,
    fetchWebsites,
    createWebsite,
    deleteWebsite,
  } = useWebsitesStore()

  const { addWebsiteModalOpen, setAddWebsiteModalOpen, showToast } = useUIStore()

  useEffect(() => {
    void fetchWebsites()

    const intervalId = window.setInterval(() => {
      void fetchWebsites()
    }, DASHBOARD_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fetchWebsites])

  const handleAddWebsite = async (url: string) => {
    try {
      await createWebsite(url)
      showToast('Website added successfully', 'success')
      setAddWebsiteModalOpen(false)
      await fetchWebsites()
    } catch (err) {
      showToast(parseErrorMessage(err), 'error')
      throw err
    }
  }

  const handleDeleteWebsite = async (id: string) => {
    try {
      await deleteWebsite(id)
      showToast('Website deleted successfully', 'success')
      await fetchWebsites()
    } catch (err) {
      showToast(parseErrorMessage(err), 'error')
      throw err
    }
  }

  return {
    websites,
    isLoadingWebsites,
    websitesError,
    addWebsiteModalOpen,
    setAddWebsiteModalOpen,
    handleAddWebsite,
    handleDeleteWebsite,
  }
}