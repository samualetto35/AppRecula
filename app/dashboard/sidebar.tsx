'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { MembershipRole } from '@/lib/types/database'

interface Props {
  companyId: string
  userRole: MembershipRole
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ companyId, userRole, isOpen, onClose }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  const handleNavigate = (path: string) => {
    router.push(path)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  const menuItems = [
    {
      label: 'Dashboard',
      path: `/dashboard?companyId=${companyId}`,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    ...(userRole === 'admin'
      ? [
          {
            label: 'Team Management',
            path: `/dashboard/team?companyId=${companyId}`,
            icon: (
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
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
          transform transition-all duration-300 ease-in-out
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
                const isActive = pathname === item.path.split('?')[0]
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full flex items-center rounded-md
                        cursor-pointer
                        px-4 py-3 gap-3 text-base
                        lg:justify-start lg:px-2 lg:py-2.5 lg:text-sm lg:gap-0
                        ${
                          isActive
                            ? 'text-black font-medium'
                            : 'text-gray-600 hover:text-black'
                        }
                      `}
                      style={{
                        backgroundColor: isActive ? '#e4e3e3' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#e4e3e3'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 lg:w-5 lg:h-5">
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${!isOpen && !isHovered ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:opacity-100 lg:ml-3'}`}>{item.label}</span>
                    </button>
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

