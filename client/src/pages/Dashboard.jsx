import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import PolicyCard from '../components/PolicyCard'
import ClaimCard from '../components/ClaimCard'
import TriggerBadge from '../components/TriggerBadge'
import { HiShieldCheck, HiDocumentText, HiCurrencyRupee, HiExclamation } from 'react-icons/hi'

// TODO Phase 3: Add FCS verification modal for borderline manual claims

export default function Dashboard() {
  const { worker } = useAuth()
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [policiesRes, claimsRes, eventsRes] = await Promise.all([
        api.get('/api/policy/my').catch(() => ({ data: [] })),
        api.get('/api/claims/my').catch(() => ({ data: [] })),
        api.get('/api/triggers/events').catch(() => ({ data: [] })),
      ])
      setPolicies(policiesRes.data)
      setClaims(claimsRes.data)
      setEvents(eventsRes.data)
    } catch (err) {
      console.error('Dashboard data fetch failed:', err)
    }
    setLoading(false)
  }

  const activePolicy = policies.find(p => p.status === 'Active')
  const recentClaims = claims.slice(0, 5)
  const recentEvents = events.slice(0, 5)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gs-border rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gs-card rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in" id="dashboard-page">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, <span className="gs-gradient-text">{worker?.name || 'Worker'}</span> 👋
        </h1>
        <p className="text-gs-text-muted mt-1">
          {worker?.platform} • Zone {worker?.pincode} • Trust: {worker?.trustTier}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="gs-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gs-teal/10 rounded-lg flex items-center justify-center">
              <HiShieldCheck className="w-5 h-5 text-gs-teal" />
            </div>
            <div>
              <p className="text-xs text-gs-text-muted">Active Policies</p>
              <p className="text-xl font-bold">{policies.filter(p => p.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="gs-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gs-warning/10 rounded-lg flex items-center justify-center">
              <HiDocumentText className="w-5 h-5 text-gs-warning" />
            </div>
            <div>
              <p className="text-xs text-gs-text-muted">Total Claims</p>
              <p className="text-xl font-bold">{claims.length}</p>
            </div>
          </div>
        </div>
        <div className="gs-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gs-success/10 rounded-lg flex items-center justify-center">
              <HiCurrencyRupee className="w-5 h-5 text-gs-success" />
            </div>
            <div>
              <p className="text-xs text-gs-text-muted">Total Payout</p>
              <p className="text-xl font-bold">
                ₹{claims.filter(c => c.status === 'Paid').reduce((sum, c) => sum + (parseFloat(c.payoutAmount) || 0), 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
        <div className="gs-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gs-danger/10 rounded-lg flex items-center justify-center">
              <HiExclamation className="w-5 h-5 text-gs-danger" />
            </div>
            <div>
              <p className="text-xs text-gs-text-muted">Zone Risk</p>
              <p className="text-xl font-bold">{worker?.zoneRiskScore || 0}/100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Policy */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Policy</h2>
            <Link to="/buy-policy" className="text-sm text-gs-teal hover:underline">Buy New →</Link>
          </div>
          {activePolicy ? (
            <PolicyCard policy={activePolicy} />
          ) : (
            <div className="gs-card text-center py-10">
              <HiShieldCheck className="w-12 h-12 text-gs-text-muted mx-auto mb-3" />
              <p className="text-gs-text-muted mb-4">No active policy. Get protected now!</p>
              <Link to="/buy-policy" className="gs-btn-primary">Buy a Policy</Link>
            </div>
          )}

          {/* Recent Claims */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Claims</h2>
              <Link to="/claims" className="text-sm text-gs-teal hover:underline">View All →</Link>
            </div>
            {recentClaims.length > 0 ? (
              <div className="space-y-3">
                {recentClaims.map(claim => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            ) : (
              <div className="gs-card text-center py-6">
                <p className="text-gs-text-muted text-sm">No claims yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Disruption Ticker */}
        <div>
          <h2 className="text-lg font-semibold mb-4">🔴 Live Disruptions</h2>
          <div className="space-y-3">
            {recentEvents.length > 0 ? recentEvents.map(event => (
              <div key={event.id} className="gs-card !p-4 animate-slide-up">
                <div className="flex items-start justify-between mb-2">
                  <TriggerBadge type={event.triggerType} />
                  <span className="text-[10px] text-gs-text-muted">
                    {new Date(event.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gs-text-muted">{event.triggerValue}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gs-text-muted">
                  <span>Zone {event.pincode}</span>
                  <span>{event.claimsCreated} claims</span>
                </div>
              </div>
            )) : (
              <div className="gs-card text-center py-6">
                <p className="text-gs-text-muted text-sm">No recent disruptions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
