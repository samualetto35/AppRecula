'use client'

import type { MembershipRole, Company } from '@/lib/types/database'

interface Props {
  companyId: string
  userRole: MembershipRole
  company: Company
}

export default function SettingsClient({ companyId, userRole, company }: Props) {
  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black mb-4">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-md p-6">
          <h2 className="text-lg font-medium text-black mb-4">Company Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue={company.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

