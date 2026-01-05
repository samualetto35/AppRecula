'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Company, MembershipRole } from '@/lib/types/database'
import Sidebar from './sidebar'
import OnboardingModal from './onboarding-modal'

interface Props {
  company: Company
  userRole: MembershipRole
  companyId: string
  userFullName: string | null
  children: React.ReactNode
}

export default function DashboardLayoutClient({ company, userRole, companyId: defaultCompanyId, userFullName, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const companyId = useMemo(() => searchParams.get('companyId') || defaultCompanyId, [searchParams, defaultCompanyId])
  const [companyData, setCompanyData] = useState(company)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
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
      <div className="min-h-screen bg-white flex flex-col" style={{ backgroundColor: '#ffffff' }}>
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

            {/* Main Content wrapper - children will be rendered here */}
            <div className="flex-1 w-full h-full">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          company={companyData}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-black mb-4">Sign Out</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

