'use client'

import { useEffect } from 'react'
import { useWebsitesStore } from '../stores/website-store'
import { useUIStore } from '../stores/ui-store'
import { parseErrorMessage } from '../lib/utils'

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
    fetchWebsites()
  }, [fetchWebsites])

  const handleAddWebsite = async (url: string) => {
    try {
      await createWebsite(url)
      showToast('Website added successfully', 'success')
      setAddWebsiteModalOpen(false)
    } catch (err) {
      showToast(parseErrorMessage(err), 'error')
      throw err
    }
  }

  const handleDeleteWebsite = async (id: string) => {
    try {
      await deleteWebsite(id)
      showToast('Website deleted successfully', 'success')
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