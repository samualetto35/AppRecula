export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full h-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200 flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

