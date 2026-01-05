'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function CandidatesClient({ companyId, userRole }: Props) {
  const [candidates, setCandidates] = useState<any[]>([])

  const sidebarItems = [
    { id: 'all', label: 'All Candidates', path: '' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/candidates" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-semibold text-black">Candidates</h1>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium">
              Import Candidates
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>All Jobs</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>All Status</option>
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Last Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Last Submission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No candidates yet. Import candidates to get started.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-black">{candidate.name}</div>
                      <div className="text-gray-500 text-xs">{candidate.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{candidate.lastJob || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{candidate.status || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{candidate.lastSubmission || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-gray-600 hover:text-black">View</button>
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

