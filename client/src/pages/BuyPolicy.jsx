import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import PremiumQuoteCard from '../components/PremiumQuoteCard'

const COVERAGE_OPTIONS = [
  { id: 'rain', label: '🌧️ Heavy Rain', desc: 'Triggered when rainfall > 15mm/3h' },
  { id: 'heat', label: '🔥 Extreme Heat', desc: 'Triggered when temp > 42°C' },
  { id: 'aqi', label: '💨 AQI Spike', desc: 'Triggered when AQI > 300' },
  { id: 'curfew', label: '🔒 Curfew', desc: 'Admin-triggered for lockdowns' },
  { id: 'flood', label: '🌊 Flood', desc: 'Admin-triggered for flooding' },
]

const SEASONS = ['summer', 'monsoon', 'winter', 'post_monsoon']

export default function BuyPolicy() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCoverage, setSelectedCoverage] = useState(['rain', 'heat', 'aqi'])
  const [pincode, setPincode] = useState(worker?.pincode || '500001')

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'summer'
    if (month >= 6 && month <= 9) return 'monsoon'
    if (month >= 10 && month <= 11) return 'post_monsoon'
    return 'winter'
  }

  const toggleCoverage = (id) => {
    setSelectedCoverage(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const getQuote = async () => {
    setQuoteLoading(true)
    setError('')
    try {
      const res = await api.post('/api/policy/quote', {
        pincode,
        currentSeason: getCurrentSeason(),
        aqi7dayAvg: 150,
        rain7dayAvgMm: 30,
        workerClaimHistory: worker?.claimCount || 0,
        workerTrustTier: worker?.trustTier || 'New',
      })
      setQuote(res.data)
    } catch (err) {
      setError('Failed to get quote. Please try again.')
    }
    setQuoteLoading(false)
  }

  const buyPolicy = async () => {
    if (selectedCoverage.length === 0) {
      setError('Select at least one coverage type')
      return
    }
    setBuyLoading(true)
    setError('')
    try {
      await api.post('/api/policy/buy', {
        pincode,
        coverageTypes: selectedCoverage,
      })
      setSuccess('🎉 Policy purchased successfully! You are now protected.')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to buy policy. Please try again.')
    }
    setBuyLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in" id="buy-policy-page">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Buy a Policy</h1>
      <p className="text-gs-text-muted mb-8">Get your AI-calculated premium and choose your coverage</p>

      {error && (
        <div className="mb-6 p-3 bg-gs-danger/10 border border-gs-danger/30 rounded-lg text-sm text-gs-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-3 bg-gs-success/10 border border-gs-success/30 rounded-lg text-sm text-gs-success">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {/* Pincode Selection */}
          <div className="gs-card">
            <h3 className="font-semibold mb-3">Delivery Zone</h3>
            <input
              type="text"
              className="gs-input"
              placeholder="Enter pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          {/* Coverage Selection */}
          <div className="gs-card">
            <h3 className="font-semibold mb-3">Coverage Types</h3>
            <div className="space-y-2">
              {COVERAGE_OPTIONS.map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCoverage.includes(opt.id)
                      ? 'border-gs-teal bg-gs-teal/5'
                      : 'border-gs-border hover:border-gs-border/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCoverage.includes(opt.id)}
                      onChange={() => toggleCoverage(opt.id)}
                      className="w-4 h-4 rounded border-gs-border text-gs-teal focus:ring-gs-teal bg-gs-bg"
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-gs-text-muted">{opt.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Get Quote Button */}
          <button
            onClick={getQuote}
            disabled={quoteLoading}
            className="w-full gs-btn-secondary !py-3"
          >
            {quoteLoading ? 'Calculating...' : '📊 Get Premium Quote'}
          </button>
        </div>

        {/* Right: Quote + Buy */}
        <div className="space-y-6">
          <PremiumQuoteCard quote={quote} loading={quoteLoading} />

          {quote && (
            <div className="gs-card">
              <h3 className="font-semibold mb-2">Policy Details</h3>
              <ul className="text-sm text-gs-text-muted space-y-1.5 mb-4">
                <li>• Duration: <strong className="text-gs-text">7 days</strong> (weekly renewal)</li>
                <li>• Coverage: <strong className="text-gs-text">{selectedCoverage.length} types</strong></li>
                <li>• Zone: <strong className="text-gs-text">{pincode}</strong></li>
                <li>• Auto-payout on trigger detection</li>
              </ul>
              <button
                onClick={buyPolicy}
                disabled={buyLoading}
                className="w-full gs-btn-primary !py-3 text-lg"
              >
                {buyLoading ? 'Processing...' : `Buy Policy — ₹${quote.weeklyPremium}/week`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
