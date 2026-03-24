import { useState, useEffect } from 'react'
import api from '../utils/api'
import ClaimCard from '../components/ClaimCard'

export default function Claims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const res = await api.get('/api/claims/my')
      setClaims(res.data)
    } catch (err) {
      console.error('Failed to fetch claims:', err)
    }
    setLoading(false)
  }

  const filteredClaims = filter === 'all'
    ? claims
    : claims.filter(c => c.status === filter)

  const statusCounts = {
    all: claims.length,
    Pending: claims.filter(c => c.status === 'Pending').length,
    Verified: claims.filter(c => c.status === 'Verified').length,
    Paid: claims.filter(c => c.status === 'Paid').length,
    Rejected: claims.filter(c => c.status === 'Rejected').length,
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gs-border rounded w-1/4" />
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gs-card rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in" id="claims-page">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Claims</h1>
      <p className="text-gs-text-muted mb-6">Track all your insurance claims and payouts</p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-gs-teal/10 text-gs-teal border border-gs-teal/30'
                : 'bg-gs-card text-gs-text-muted border border-gs-border hover:border-gs-teal/20'
            }`}
          >
            {status === 'all' ? 'All' : status} ({count})
          </button>
        ))}
      </div>

      {/* Claims list */}
      {filteredClaims.length > 0 ? (
        <div className="space-y-3">
          {filteredClaims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      ) : (
        <div className="gs-card text-center py-12">
          <p className="text-gs-text-muted">No claims found for this filter</p>
        </div>
      )}
    </div>
  )
}
