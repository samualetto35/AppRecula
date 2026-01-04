'use client'

import Link from 'next/link'

interface Props {
  reason: string
}

const reasonMessages: Record<string, { title: string; message: string }> = {
  company_suspended: {
    title: 'Company Access Suspended',
    message: 'Your company account has been suspended. Please contact your administrator.',
  },
  unknown: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
  },
}

export default function AccessDeniedClient({ reason }: Props) {
  const { title, message } = reasonMessages[reason] || reasonMessages.unknown

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-medium text-black">{title}</h1>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <Link
          href="/select-company"
          className="inline-block rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Go to Company Selection
        </Link>
      </div>
    </div>
  )
}

