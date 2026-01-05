'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function ActivityClient({ companyId, userRole }: Props) {
  const [activities, setActivities] = useState<any[]>([])

  const sidebarItems = [
    { id: 'all', label: 'All Activity', path: '' },
    { id: 'issues', label: 'Pending Issues', path: '/issues' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/activity" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-4">Activity / Inbox</h1>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity yet.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-black">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  {activity.type === 'issue' && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Issue</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

