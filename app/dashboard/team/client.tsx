'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Company } from '@/lib/types/database'

interface Membership {
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

interface Props {
  company: Company
}

export default function TeamManagementClient({ company }: Props) {
  const router = useRouter()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'recruiter' as 'admin' | 'recruiter' | 'viewer',
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMemberships()
  }, [])

  const loadMemberships = async () => {
    try {
      const response = await fetch(`/api/memberships/list?companyId=${company.id}`)
      const data = await response.json()
      if (response.ok) {
        setMemberships(data.memberships || [])
      }
    } catch (err) {
      console.error('Error loading memberships:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setError('')

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
          companyId: company.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to invite user')
        setInviteLoading(false)
        return
      }

      // Reset form and reload
      setInviteForm({ email: '', fullName: '', role: 'recruiter' })
      setShowInviteModal(false)
      await loadMemberships()
    } catch (err) {
      setError('An error occurred. Please try again.')
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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-black mb-1"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-medium text-black">Team Management</h1>
            <p className="text-sm text-gray-600">{company.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-black">Team Members</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
          >
            Invite User
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : (
          <div className="border border-gray-200 rounded">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memberships.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-600">
                      No team members yet
                    </td>
                  </tr>
                ) : (
                  memberships.map((membership) => (
                    <tr key={membership.id}>
                      <td className="px-4 py-3 text-sm text-black">
                        {membership.profile?.full_name || membership.full_name || membership.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {membership.profile?.email || membership.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black capitalize">
                        {membership.role}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(membership.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(membership.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
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

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false)
                      setError('')
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
  )
}

