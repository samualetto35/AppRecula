'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { MembershipRole } from '@/lib/types/database'

interface Props {
  companyId: string
  userRole: MembershipRole
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ companyId, userRole, isOpen, onClose }: Props) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const [currentPath, setCurrentPath] = useState(pathname)
  const [clickedPath, setClickedPath] = useState<string | null>(null)

  // Update current path immediately when pathname changes
  useEffect(() => {
    setCurrentPath(pathname)
    setClickedPath(null) // Clear clicked path when navigation completes
  }, [pathname])

  // Close sidebar on mobile after navigation
  const handleLinkClick = (itemPath: string) => {
    // Optimistic update - immediately set as active
    const cleanPath = itemPath.split('?')[0]
    setClickedPath(cleanPath)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose()
    }
  }

  const getIcon = (name: string) => {
    const icons: Record<string, JSX.Element> = {
      dashboard: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      jobs: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      candidates: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      interviews: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      templates: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      analytics: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      inbox: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      team: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      integrations: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 011-1V4z" />
        </svg>
      ),
      settings: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    }
    return icons[name] || icons.dashboard
  }

  const menuItems = [
    {
      label: 'Dashboard',
      path: `/dashboard?companyId=${companyId}`,
      icon: getIcon('dashboard'),
    },
    {
      label: 'Jobs',
      path: `/dashboard/jobs?companyId=${companyId}`,
      icon: getIcon('jobs'),
    },
    {
      label: 'Candidates',
      path: `/dashboard/candidates?companyId=${companyId}`,
      icon: getIcon('candidates'),
    },
    {
      label: 'Interviews',
      path: `/dashboard/interviews?companyId=${companyId}`,
      icon: getIcon('interviews'),
    },
    {
      label: 'Templates',
      path: `/dashboard/templates?companyId=${companyId}`,
      icon: getIcon('templates'),
    },
    {
      label: 'Analytics',
      path: `/dashboard/analytics?companyId=${companyId}`,
      icon: getIcon('analytics'),
    },
    {
      label: 'Inbox',
      path: `/dashboard/activity?companyId=${companyId}`,
      icon: getIcon('inbox'),
    },
    ...(userRole === 'admin'
      ? [
          {
            label: 'Team Management',
            path: `/dashboard/team?companyId=${companyId}`,
            icon: getIcon('team'),
          },
          {
            label: 'Integrations',
            path: `/dashboard/integrations?companyId=${companyId}`,
            icon: getIcon('integrations'),
          },
          {
            label: 'Settings',
            path: `/dashboard/settings?companyId=${companyId}`,
            icon: getIcon('settings'),
          },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/10 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          transform transition-all duration-150 ease-in-out
          lg:border-r lg:border-gray-200
          ${isOpen 
            ? 'translate-x-0 w-80 lg:w-56 lg:relative h-full' 
            : `-translate-x-full lg:translate-x-0 ${isHovered ? 'lg:absolute lg:w-56 lg:z-[60] lg:shadow-none' : 'lg:relative lg:w-14 lg:z-auto lg:shadow-none'} shadow-lg lg:shadow-none h-full`
          }
          overflow-hidden
          bg-white lg:bg-transparent
        `}
        onMouseEnter={() => {
          if (!isOpen && typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsHovered(true)
          }
        }}
        onMouseLeave={() => {
          if (!isOpen && typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsHovered(false)
          }
        }}
      >
        <div className={`flex flex-col h-full ${!isOpen && !isHovered ? '' : ''}`}>
          {/* Sidebar header (mobile only) */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-black">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 bg-white lg:bg-[#f9f9f9] ${!isOpen && !isHovered ? 'lg:p-2' : 'p-4 lg:p-2'}`}>
            <ul className="space-y-2 lg:space-y-1">
              {menuItems.map((item) => {
                const itemPath = item.path.split('?')[0]

                // Dashboard özel durumu: sadece tam /dashboard iken aktif olsun
                const isDashboard = itemPath === '/dashboard'
                const isActive =
                  clickedPath === itemPath ||
                  (!isDashboard &&
                    (currentPath === itemPath || currentPath.startsWith(`${itemPath}/`))) ||
                  (isDashboard && currentPath === itemPath)

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      prefetch={true}
                      onClick={() => handleLinkClick(itemPath)}
                      className={`
                        w-full flex items-center rounded-md
                        cursor-pointer
                        px-4 py-3 gap-3 text-base
                        lg:justify-start lg:px-2 lg:py-2.5 lg:text-sm lg:gap-0
                        transition-colors
                        ${
                          isActive
                            ? 'text-black font-medium bg-[#e4e3e3]'
                            : 'text-gray-600 hover:text-black hover:bg-[#e4e3e3]'
                        }
                      `}
                    >
                      <span className="flex-shrink-0 w-6 h-6 lg:w-5 lg:h-5">
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-150 ease-in-out whitespace-nowrap ${!isOpen && !isHovered ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:opacity-100 lg:ml-3'}`}>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

