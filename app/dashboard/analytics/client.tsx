'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function AnalyticsClient({ companyId, userRole }: Props) {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', path: '' },
    { id: 'funnel', label: 'Funnel', path: '/funnel' },
    { id: 'jobs', label: 'Per Job', path: '/jobs' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/analytics" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-4">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-md p-4">
            <div className="text-sm text-gray-600 mb-1">Invited</div>
            <div className="text-2xl font-semibold text-black">0</div>
          </div>
          <div className="border border-gray-200 rounded-md p-4">
            <div className="text-sm text-gray-600 mb-1">Started</div>
            <div className="text-2xl font-semibold text-black">0</div>
          </div>
          <div className="border border-gray-200 rounded-md p-4">
            <div className="text-sm text-gray-600 mb-1">Submitted</div>
            <div className="text-2xl font-semibold text-black">0</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-6">
          <h2 className="text-lg font-medium text-black mb-4">Completion Funnel</h2>
          <p className="text-gray-600">Charts will be displayed here...</p>
        </div>
      </div>
    </div>
  )
}

