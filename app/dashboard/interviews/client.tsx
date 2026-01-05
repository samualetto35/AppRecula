'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function InterviewsClient({ companyId, userRole }: Props) {
  const [interviews, setInterviews] = useState<any[]>([])

  const sidebarItems = [
    { id: 'all', label: 'All Interviews', path: '' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/interviews" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-4">Interviews</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>All Jobs</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>All Status</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>Date Range</option>
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No interviews yet.
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{interview.candidate || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{interview.job || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{interview.status || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{interview.progress || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{interview.deadline || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-gray-600 hover:text-black">Actions</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

