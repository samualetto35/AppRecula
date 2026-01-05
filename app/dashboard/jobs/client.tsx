'use client'

import { useState } from 'react'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../page-sidebar'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function JobsClient({ companyId, userRole }: Props) {
  const [jobs, setJobs] = useState<any[]>([])

  const sidebarItems = [
    { id: 'list', label: 'All Jobs', path: '' },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/jobs" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-semibold text-black">Jobs</h1>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium">
              Create Job
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search jobs..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>All Status</option>
              <option>Draft</option>
              <option>Active</option>
              <option>Closed</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
              <option>Sort by newest</option>
              <option>Most candidates</option>
              <option>Most submissions</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Candidates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Submissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No jobs yet. Create your first job to get started.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-black">{job.title}</div>
                      <div className="text-gray-500 text-xs">{job.status}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.candidatesCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.submissionsCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.deadline || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.owner || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-gray-600 hover:text-black">⋯</button>
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

