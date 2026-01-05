'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, MembershipRole } from '@/lib/types/database'
import OnboardingModal from './onboarding-modal'

interface Props {
  company: Company
  userRole: MembershipRole
  companyId: string
  userFullName: string | null
}

export default function DashboardContent({ company, userRole, companyId, userFullName }: Props) {
  const router = useRouter()
  const [companyData, setCompanyData] = useState(company)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamMembersLoading, setTeamMembersLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'recruiter' as 'admin' | 'recruiter' | 'viewer',
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    if (!companyData.onboarding_completed) {
      setShowOnboarding(true)
    }
  }, [companyData.onboarding_completed])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setTeamMembersLoading(true)
      try {
        const response = await fetch(`/api/memberships/list?companyId=${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data.memberships || [])
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setTeamMembersLoading(false)
      }
    }

    // Fetch team members for all roles (admin, recruiter, viewer)
    fetchTeamMembers()
  }, [companyId])

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError('')

    try {
      const response = await fetch('/api/memberships/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          ...inviteForm,
        }),
      })

      if (response.ok) {
        setInviteForm({ email: '', fullName: '', role: 'recruiter' })
        setShowInviteModal(false)
        // Refresh team members
        const membersResponse = await fetch(`/api/memberships/list?companyId=${companyId}`)
        if (membersResponse.ok) {
          const data = await membersResponse.json()
          setTeamMembers(data.memberships || [])
        }
      } else {
        const error = await response.json()
        setInviteError(error.message || 'Failed to send invitation')
      }
    } catch (error) {
      setInviteError('An error occurred. Please try again.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleOnboardingComplete = (updatedCompany: Company) => {
    setCompanyData(updatedCompany)
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
  }

  return (
    <>
      <div className="flex-1 w-full h-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <main className="h-full">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-black mb-2">
              Welcome{userFullName ? `, ${userFullName}` : ''}
            </h2>
            <p className="text-sm text-gray-600">
              You are logged in as <span className="font-medium capitalize">{userRole}</span>
            </p>
          </div>

          <div className="rounded">
            <h3 className="text-base font-medium text-black mb-4">Company Information</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-600">Company Name</dt>
                <dd className="mt-1 text-sm text-black">{companyData.name}</dd>
              </div>
              {companyData.website && (
                <div>
                  <dt className="text-sm text-gray-600">Website</dt>
                  <dd className="mt-1 text-sm text-black">{companyData.website}</dd>
                </div>
              )}
              {companyData.country && (
                <div>
                  <dt className="text-sm text-gray-600">Country</dt>
                  <dd className="mt-1 text-sm text-black">{companyData.country}</dd>
                </div>
              )}
              {companyData.sector && (
                <div>
                  <dt className="text-sm text-gray-600">Sector</dt>
                  <dd className="mt-1 text-sm text-black">{companyData.sector}</dd>
                </div>
              )}
              {companyData.size_range && (
                <div>
                  <dt className="text-sm text-gray-600">Size Range</dt>
                  <dd className="mt-1 text-sm text-black">{companyData.size_range}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-8 rounded">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-black">Team Members</h3>
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Invite Member
                </button>
              )}
            </div>

            {teamMembersLoading ? (
              <p className="text-sm text-gray-600">Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p className="text-sm text-gray-600">No team members yet.</p>
            ) : (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                {/* Mobile scrollable wrapper */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-3 text-sm text-black whitespace-nowrap">{member.full_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{member.email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">{member.role}</td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : member.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          company={companyData}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-black mb-4">Invite Team Member</h2>
            <form onSubmit={handleInviteSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'admin' | 'recruiter' | 'viewer' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="recruiter">Recruiter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-600">{inviteError}</p>
                )}
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteError('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

