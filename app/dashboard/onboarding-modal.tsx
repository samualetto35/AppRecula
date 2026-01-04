'use client'

import { useState } from 'react'
import type { Company } from '@/lib/types/database'

interface Props {
  company: Company
  onComplete: (company: Company) => void
  onSkip: () => void
}

export default function OnboardingModal({ company, onComplete, onSkip }: Props) {
  const [formData, setFormData] = useState({
    country: company.country || '',
    sector: company.sector || '',
    sizeRange: company.size_range || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/company/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: company.id,
          country: formData.country || null,
          sector: formData.sector || null,
          sizeRange: formData.sizeRange || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      onComplete(data.company)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-medium text-black mb-2">Complete Company Onboarding</h2>
        <p className="text-sm text-gray-600 mb-6">
          Please provide additional information about your company (optional fields can be skipped).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-black mb-1">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="United States"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-black mb-1">
              Sector
            </label>
            <input
              id="sector"
              name="sector"
              type="text"
              value={formData.sector}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
              placeholder="Technology"
            />
          </div>

          <div>
            <label htmlFor="sizeRange" className="block text-sm font-medium text-black mb-1">
              Company Size Range
            </label>
            <select
              id="sizeRange"
              name="sizeRange"
              value={formData.sizeRange}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:border-black"
            >
              <option value="">Select size range</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-2 text-sm text-black border border-gray-300 rounded hover:bg-gray-50"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

