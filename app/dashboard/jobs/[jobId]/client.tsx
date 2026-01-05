'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MembershipRole } from '@/lib/types/database'
import PageSidebar from '../../page-sidebar'

interface Props {
  jobId: string
  companyId: string
  userRole: MembershipRole
  initialTab: string
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'questions', label: 'Questions' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'invites', label: 'Invites' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'settings', label: 'Settings' },
  ...(true ? [{ id: 'audit', label: 'Audit' }] : []), // Admin only
]

export default function JobDetailClient({ jobId, companyId, userRole, initialTab }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/dashboard/jobs/${jobId}?companyId=${companyId}&tab=${tabId}`)
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', path: `/jobs/${jobId}?tab=overview` },
    { id: 'questions', label: 'Questions', path: `/jobs/${jobId}?tab=questions` },
    { id: 'candidates', label: 'Candidates', path: `/jobs/${jobId}?tab=candidates` },
    { id: 'invites', label: 'Invites', path: `/jobs/${jobId}?tab=invites` },
    { id: 'submissions', label: 'Submissions', path: `/jobs/${jobId}?tab=submissions` },
    { id: 'scorecard', label: 'Scorecard', path: `/jobs/${jobId}?tab=scorecard` },
    { id: 'settings', label: 'Settings', path: `/jobs/${jobId}?tab=settings` },
    ...(userRole === 'admin' ? [{ id: 'audit', label: 'Audit', path: `/jobs/${jobId}?tab=audit` }] : []),
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Job Overview</h2>
            <p className="text-gray-600">Overview content will go here...</p>
          </div>
        )
      case 'questions':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Questions</h2>
            <p className="text-gray-600">Questions builder will go here...</p>
          </div>
        )
      case 'candidates':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Candidates</h2>
            <p className="text-gray-600">Candidates table will go here...</p>
          </div>
        )
      case 'invites':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Invites</h2>
            <p className="text-gray-600">Invite configuration will go here...</p>
          </div>
        )
      case 'submissions':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Submissions</h2>
            <p className="text-gray-600">Submissions list will go here...</p>
          </div>
        )
      case 'scorecard':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Scorecard</h2>
            <p className="text-gray-600">Scoring rubric will go here...</p>
          </div>
        )
      case 'settings':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Job settings will go here...</p>
          </div>
        )
      case 'audit':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
            <p className="text-gray-600">Audit log will go here...</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <PageSidebar items={sidebarItems} basePath="/dashboard/jobs" companyId={companyId} />
      
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-2">Job Title</h1>
          <p className="text-gray-600 text-sm">Job ID: {jobId}</p>
        </div>

        {renderTabContent()}
      </div>
    </div>
  )
}

