export function LoadingState() {
  return (
    <div
      className="flex items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="animate-spin">
        <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    </div>
  )
}