'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, MembershipRole } from '@/lib/types/database'
import OnboardingModal from './onboarding-modal'

interface Props {
  company: Company
  userRole: MembershipRole
  companyId: string
}

export default function DashboardClient({ company, userRole, companyId }: Props) {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [companyData, setCompanyData] = useState(company)

  useEffect(() => {
    if (!companyData.onboarding_completed) {
      setShowOnboarding(true)
    }
  }, [companyData.onboarding_completed])

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

  const handleOnboardingComplete = (updatedCompany: Company) => {
    setCompanyData(updatedCompany)
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium text-black">Dashboard</h1>
              <p className="text-sm text-gray-600">{companyData.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-black border border-gray-300 rounded hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-black mb-2">Welcome</h2>
            <p className="text-sm text-gray-600">
              You are logged in as <span className="font-medium capitalize">{userRole}</span>
            </p>
            
            {/* Role-based access indicators */}
            {userRole === 'admin' && (
              <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Admin Access:</strong> You have full access to company settings and user management.
                </p>
              </div>
            )}
            {userRole === 'recruiter' && (
              <div className="mt-4 rounded border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Recruiter Access:</strong> You can manage recruitment activities.
                </p>
              </div>
            )}
            {userRole === 'viewer' && (
              <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-800">
                  <strong>Viewer Access:</strong> You have read-only access to company information.
                </p>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded p-6">
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
            <div className="mt-8 border border-gray-200 rounded p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-black">Team Management</h3>
                <button
                  onClick={() => router.push(`/dashboard/team?companyId=${companyId}`)}
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
                >
                  Manage Team
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Invite team members and manage their access to your company.
              </p>
            </div>
          )}
        </main>
      </div>

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

