'use client'

import { create } from 'zustand'

import type { ToastType } from '../types/common'

interface UIStore {
  sidebarOpen: boolean
  addWebsiteModalOpen: boolean
  toastMessage: string | null
  toastType: ToastType
  toastTimeoutId: ReturnType<typeof setTimeout> | null

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleAddWebsiteModal: () => void
  setAddWebsiteModalOpen: (open: boolean) => void
  showToast: (message: string, type?: ToastType) => void
  hideToast: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: true,
  addWebsiteModalOpen: false,
  toastMessage: null,
  toastType: 'info',
  toastTimeoutId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  toggleAddWebsiteModal: () =>
    set((state) => ({ addWebsiteModalOpen: !state.addWebsiteModalOpen })),
  setAddWebsiteModalOpen: (open: boolean) => set({ addWebsiteModalOpen: open }),

  showToast: (message: string, type: ToastType = 'info') => {
    const existingTimeout = get().toastTimeoutId

    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const timeoutId = setTimeout(() => {
      set({ toastMessage: null, toastTimeoutId: null })
    }, 4000)

    set({
      toastMessage: message,
      toastType: type,
      toastTimeoutId: timeoutId,
    })
  },

  hideToast: () => {
    const existingTimeout = get().toastTimeoutId

    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    set({
      toastMessage: null,
      toastTimeoutId: null,
    })
  },
}))