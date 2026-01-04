'use client'

import Link from 'next/link'

interface PendingMembership {
  id: string
  company_id: string
  company: {
    id: string
    name: string | null
  } | null
  role: string
}

interface Props {
  userEmail: string
  pendingMemberships: PendingMembership[]
}

export default function SetupClient({ userEmail, pendingMemberships }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-medium text-black">Complete Your Setup</h1>
        <p className="mb-6 text-sm text-gray-600">
          Your account is not associated with any organization yet.
        </p>

        {pendingMemberships.length > 0 ? (
          <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
            <p className="mb-2 text-sm font-medium text-yellow-800">
              You have pending invitations:
            </p>
            <ul className="list-disc pl-5 text-sm text-yellow-700">
              {pendingMemberships.map((membership) => (
                <li key={membership.id}>
                  {membership.company?.name || `Company (ID: ${membership.company_id?.substring(0, 8)}...)`} ({membership.role})
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-yellow-600">
              Your memberships will be activated automatically after you log in.
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              No pending invitations found for <strong>{userEmail}</strong>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/register"
            className="block w-full rounded bg-black px-4 py-2 text-center text-white hover:bg-gray-800"
          >
            Create New Organization
          </Link>
          <Link
            href="/login"
            className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-black hover:bg-gray-50"
          >
            Try Logging In Again
          </Link>
        </div>
      </div>
    </div>
  )
}

