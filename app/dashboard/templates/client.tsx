'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function TemplatesClient({ companyId, userRole }: Props) {
  const sidebarItems = [
    { id: 'emails', label: 'Email Templates', path: '' },
    { id: 'questions', label: 'Question Sets', path: '/questions' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/templates" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-4">Templates</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-md p-4 hover:border-gray-300 cursor-pointer">
            <h3 className="font-medium text-black mb-2">Invite Email</h3>
            <p className="text-sm text-gray-600">Template for sending interview invites</p>
          </div>
          <div className="border border-gray-200 rounded-md p-4 hover:border-gray-300 cursor-pointer">
            <h3 className="font-medium text-black mb-2">Reminder Email</h3>
            <p className="text-sm text-gray-600">Template for reminder emails</p>
          </div>
          <div className="border border-gray-200 rounded-md p-4 hover:border-gray-300 cursor-pointer">
            <h3 className="font-medium text-black mb-2">Rejection Email</h3>
            <p className="text-sm text-gray-600">Template for rejection emails</p>
          </div>
        </div>
      </div>
    </div>
  )
}

