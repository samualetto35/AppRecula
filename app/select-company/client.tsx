'use client'

import { useRouter } from 'next/navigation'
import type { MembershipWithCompany } from '@/lib/types/database'

interface Props {
  memberships: MembershipWithCompany[]
}

export default function CompanySelectionClient({ memberships }: Props) {
  const router = useRouter()

  const handleSelect = (companyId: string) => {
    router.push(`/dashboard?companyId=${companyId}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-medium text-black">Select Company</h1>
        <p className="mb-8 text-sm text-gray-600">
          You have access to multiple companies. Please select one to continue.
        </p>

        <div className="space-y-3">
          {memberships.map((membership) => (
            <button
              key={membership.id}
              onClick={() => handleSelect(membership.company_id)}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded hover:border-black hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-black">{membership.company.name}</div>
              <div className="text-sm text-gray-600 capitalize">{membership.role}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

