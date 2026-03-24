import { useUIStore } from '../../stores/ui-store'

export function Toast() {
  const { toastMessage, toastType } = useUIStore()

  if (!toastMessage) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[toastType]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 text-white shadow-lg ${bgColor}`}
    >
      {toastMessage}
    </div>
  )
}