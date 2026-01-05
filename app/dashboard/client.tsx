'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, MembershipRole } from '@/lib/types/database'
import OnboardingModal from './onboarding-modal'
import Sidebar from './sidebar'

interface Props {
  company: Company
  userRole: MembershipRole
  companyId: string
  userFullName: string | null
}

interface TeamMember {
  id: string
  user_id: string | null
  email: string | null
  full_name: string | null
  role: string
  status: string
  created_at: string
  profile: {
    id: string
    full_name: string
    email: string
    job_title: string
  } | null
}

export default function DashboardClient({ company, userRole, companyId, userFullName }: Props) {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [companyData, setCompanyData] = useState(company)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamMembersLoading, setTeamMembersLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'recruiter' as 'admin' | 'recruiter' | 'viewer',
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  // Initialize with default value to avoid hydration mismatch
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load sidebar preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen')
      if (saved !== null) {
        setSidebarOpen(saved === 'true')
      }
    }
  }, [])

  // Save sidebar preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', String(sidebarOpen))
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (!companyData.onboarding_completed) {
      setShowOnboarding(true)
    }
  }, [companyData.onboarding_completed])

  // Load team members if admin
  useEffect(() => {
    if (userRole === 'admin') {
      loadTeamMembers()
    }
  }, [userRole, companyId])

  const loadTeamMembers = async () => {
    setTeamMembersLoading(true)
    try {
      const response = await fetch(`/api/memberships/list?companyId=${companyId}`)
      const data = await response.json()
      if (response.ok) {
        setTeamMembers(data.memberships || [])
      }
    } catch (err) {
      console.error('Error loading team members:', err)
    } finally {
      setTeamMembersLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError('')

    try {
      const response = await fetch('/api/memberships/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteForm.email,
          fullName: inviteForm.fullName,
          role: inviteForm.role,
          companyId: companyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setInviteError(data.error || 'Failed to invite user')
        setInviteLoading(false)
        return
      }

      // Reset form and reload
      setInviteForm({ email: '', fullName: '', role: 'recruiter' })
      setShowInviteModal(false)
      await loadTeamMembers()
    } catch (err) {
      setInviteError('An error occurred. Please try again.')
    } finally {
      setInviteLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
    }
    if (status === 'pending') {
      return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending</span>
    }
    return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">Revoked</span>
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear any client-side state if needed
      router.push('/login')
      // Force a hard refresh to clear any cached state
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      router.push('/login')
    }
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    handleLogout()
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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header - Full width, not affected by sidebar */}
        <header className="border-b border-gray-200" style={{ backgroundColor: '#f9f9f9' }}>
          <div className="px-4 sm:px-6 lg:px-2 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded cursor-pointer"
                aria-label="Toggle menu"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 4C4.34315 4 3 5.34315 3 7V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V7C21 5.34315 19.6569 4 18 4H6ZM5 7C5 6.44772 5.44772 6 6 6H13V18H6C5.44772 18 5 17.5523 5 17V7ZM15 18H18C18.5523 18 19 17.5523 19 17V7C19 6.44772 18.5523 6 18 6H15V18Z" fill="currentColor"/>
                </svg>
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded cursor-pointer"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 4C4.34315 4 3 5.34315 3 7V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V7C21 5.34315 19.6569 4 18 4H6ZM5 7C5 6.44772 5.44772 6 6 6H13V18H6C5.44772 18 5 17.5523 5 17V7ZM15 18H18C18.5523 18 19 17.5523 19 17V7C19 6.44772 18.5523 6 18 6H15V18Z" fill="currentColor"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-black">Recula</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-600">{companyData.name}</span>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-3 py-1.5 text-xs text-black border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Content area - Split between sidebar and main content */}
        <div className="flex flex-1" style={{ backgroundColor: '#f9f9f9' }}>
          <div className="flex w-full rounded-xl" style={{ backgroundColor: '#f9f9f9' }}>
            {/* Sidebar wrapper */}
            <div className={`lg:relative lg:flex-shrink-0 ${sidebarOpen ? 'lg:w-56' : 'lg:w-14'}`} style={{ backgroundColor: '#f5f5f5' }}>
              <Sidebar
                companyId={companyId}
                userRole={userRole}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Main Content wrapper */}
            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
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

          {!companyData.onboarding_completed && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Complete your company onboarding to access all features.
              </p>
            </div>
          )}

          {/* Admin-only: Team Management Section */}
          {userRole === 'admin' && (
            <div className="mt-8 rounded">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-black">Team Members</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
                >
                  Invite User
                </button>
              </div>
              
              {teamMembersLoading ? (
                <p className="text-sm text-gray-600">Loading team members...</p>
              ) : teamMembers.length === 0 ? (
                <p className="text-sm text-gray-600">No team members yet.</p>
              ) : (
                <div className="mt-4 border border-gray-200 rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-200">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-200">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-200">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-black">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-black border-r border-gray-200">
                              {member.profile?.full_name || member.full_name || member.email || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                              {member.profile?.email || member.email || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-black capitalize border-r border-gray-200">
                              {member.role}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              {getStatusBadge(member.status)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(member.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ boxShadow: 'inset 0 0 0 1000px rgba(0, 0, 0, 0.3)' }}>
              <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 border border-gray-200 shadow-2xl">
                <h2 className="text-xl font-medium text-black mb-4">Invite User</h2>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
                      placeholder="user@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-black mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={inviteForm.fullName}
                      onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-black mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {inviteError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                      {inviteError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteModal(false)
                        setInviteError('')
                        setInviteForm({ email: '', fullName: '', role: 'recruiter' })
                      }}
                      className="flex-1 px-4 py-2 text-sm text-black border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="flex-1 px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
            </main>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ boxShadow: 'inset 0 0 0 1000px rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 border border-gray-200 shadow-2xl">
            <h2 className="text-xl font-medium text-black mb-4">Sign Out</h2>
            <p className="text-sm text-gray-600 mb-6">
              Çıkmak istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          company={companyData}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  )
}

