'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    companyName: '',
    companyWebsite: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const errorParam = searchParams.get('error')
  const errorMessages: Record<string, string> = {
    profile_creation_failed: 'Failed to create profile. Please try again.',
    company_creation_failed: 'Failed to create company. Please try again.',
    membership_creation_failed: 'Failed to create membership. Please try again.',
    no_memberships: 'No company memberships found. Please register.',
  }
  const [error, setError] = useState(errorParam ? errorMessages[errorParam] || 'An error occurred' : '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite || undefined,
          phone: formData.phone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      setMessage('Check your email for the magic link to complete registration.')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-medium text-black">Create account</h1>
        <p className="mb-8 text-sm text-gray-600">
          Sign up to create your company account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-black mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-black mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="HR Manager"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-black mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium text-black mb-1">
              Company Website
            </label>
            <input
              id="companyWebsite"
              name="companyWebsite"
              type="url"
              value={formData.companyWebsite}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="https://company.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="+1 234 567 8900"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded border border-green-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-black underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-medium text-black">Create account</h1>
          <p className="mb-8 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
