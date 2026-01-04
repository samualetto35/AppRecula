'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check for error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        session_exchange_failed: 'Failed to establish session. Please try again.',
        user_fetch_failed: 'Failed to authenticate. Please try again.',
        no_memberships: 'No company memberships found. Please register first.',
      }
      setError(errorMessages[errorParam] || 'An error occurred. Please try again.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      setMessage('Check your email for the magic link to sign in.')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-medium text-black">Sign in</h1>
        <p className="mb-8 text-sm text-gray-600">
          Enter your email to receive a magic link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="you@company.com"
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
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-black underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

