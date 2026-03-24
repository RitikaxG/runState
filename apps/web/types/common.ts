export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type UserRole = 'USER' | 'ADMIN'
export type WebsiteStatus = 'up' | 'down' | 'unknown'
export type ToastType = 'success' | 'error' | 'info'

export type UIState = {
  sidebarOpen: boolean
  addWebsiteModalOpen: boolean
  toastMessage: string | null
  toastType: ToastType
}