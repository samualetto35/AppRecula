'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PageSidebarItem {
  label: string
  path: string
  id: string
}

interface Props {
  items: PageSidebarItem[]
  basePath: string
  companyId: string
}

export default function PageSidebar({ items, basePath, companyId }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')
  const [clickedItemId, setClickedItemId] = useState<string | null>(null)

  // Clear clicked item when pathname changes (navigation completed)
  useEffect(() => {
    setClickedItemId(null)
  }, [pathname])

  const isActive = (item: PageSidebarItem) => {
    // Optimistic update - if clicked, show as active immediately
    if (clickedItemId === item.id) {
      return true
    }
    if (item.path === '') {
      // Base path - check if we're on the base path without sub-paths
      const pathAfterBase = pathname.replace(basePath, '')
      return pathname === basePath || (pathname.startsWith(basePath) && (!pathAfterBase || pathAfterBase === '/'))
    }
    
    // Check if path contains tab parameter
    if (item.path.includes('?tab=')) {
      const tabId = item.path.split('tab=')[1]?.split('&')[0]
      return currentTab === tabId
    }
    
    // Regular path matching
    const itemPath = `${basePath}${item.path}`
    const cleanItemPath = itemPath.split('?')[0]
    return pathname === cleanItemPath || pathname.startsWith(`${cleanItemPath}/`)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-48 flex-shrink-0 border-r border-gray-200 bg-[#f9f9f9]">
        <nav className="p-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const fullPath = `${basePath}${item.path}?companyId=${companyId}`
              const active = isActive(item)
              return (
                <li key={item.id}>
                  <Link
                    href={fullPath}
                    prefetch={true}
                    onClick={() => setClickedItemId(item.id)}
                    className={`
                      block px-3 py-2 text-sm rounded-md transition-colors
                      ${
                        active
                          ? 'text-black font-medium bg-[#e4e3e3]'
                          : 'text-gray-600 hover:text-black hover:bg-[#e4e3e3]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Horizontal Scrollable Menu */}
      <div className="lg:hidden w-full overflow-x-auto border-b border-gray-200 bg-white">
        <nav className="px-4 py-2">
          <ul className="flex gap-2 min-w-max">
            {items.map((item) => {
              const fullPath = `${basePath}${item.path}?companyId=${companyId}`
              const active = isActive(item)
              return (
                <li key={item.id}>
                  <Link
                    href={fullPath}
                    prefetch={true}
                    onClick={() => setClickedItemId(item.id)}
                    className={`
                      block px-4 py-2 text-sm whitespace-nowrap rounded-full transition-colors
                      ${
                        active
                          ? 'text-black font-medium bg-[#e4e3e3]'
                          : 'text-gray-600 hover:text-black hover:bg-gray-100'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

