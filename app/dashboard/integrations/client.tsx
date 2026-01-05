'use client'

import type { MembershipRole } from '@/lib/types/database'

interface Props {
  companyId: string
  userRole: MembershipRole
}

export default function IntegrationsClient({ companyId, userRole }: Props) {
  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 border-b border-r border-gray-200" style={{ backgroundColor: '#ffffff' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black mb-4">Integrations</h1>
      </div>

      <div className="border border-gray-200 rounded-md p-8 text-center">
        <p className="text-gray-600 mb-4">Coming soon</p>
        <p className="text-sm text-gray-500">Integrations with ATS and other tools will be available here.</p>
      </div>
    </div>
  )
}

