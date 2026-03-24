export default function PremiumQuoteCard({ quote, loading }) {
  if (loading) {
    return (
      <div className="gs-card animate-pulse">
        <div className="h-4 bg-gs-border rounded w-1/3 mb-4" />
        <div className="h-8 bg-gs-border rounded w-1/2 mb-6" />
        <div className="space-y-2">
          <div className="h-3 bg-gs-border rounded w-full" />
          <div className="h-3 bg-gs-border rounded w-4/5" />
          <div className="h-3 bg-gs-border rounded w-3/5" />
        </div>
      </div>
    )
  }

  if (!quote) return null

  const breakdownLabels = {
    zone_factor: { label: 'Zone Risk', icon: '📍' },
    weather_factor: { label: 'Weather Risk', icon: '🌦️' },
    history_factor: { label: 'Claim History', icon: '📋' },
    trust_discount: { label: 'Trust Discount', icon: '✅' },
  }

  return (
    <div className="gs-card relative overflow-hidden" id="premium-quote-card">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gs-teal via-emerald-400 to-cyan-400" />

      <p className="text-sm text-gs-text-muted mb-1">Estimated Weekly Premium</p>
      <p className="text-4xl font-bold gs-gradient-text mb-1">₹{quote.weeklyPremium}</p>
      <p className="text-xs text-gs-text-muted mb-6">per week</p>

      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-1 bg-gs-bg rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{
              width: `${quote.riskScore}%`,
              background: `linear-gradient(to right, 
                ${quote.riskScore < 40 ? '#22c55e' : quote.riskScore < 70 ? '#f59e0b' : '#ef4444'}, 
                ${quote.riskScore < 40 ? '#4ade80' : quote.riskScore < 70 ? '#fbbf24' : '#f87171'})`,
            }}
          />
        </div>
        <span className={`text-sm font-semibold ${
          quote.riskScore < 40 ? 'text-gs-success' : quote.riskScore < 70 ? 'text-gs-warning' : 'text-gs-danger'
        }`}>
          Risk: {quote.riskScore}/100
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gs-text-muted uppercase tracking-wider font-semibold">Breakdown</p>
        {quote.breakdown && Object.entries(quote.breakdown).map(([key, value]) => {
          const config = breakdownLabels[key] || { label: key, icon: '📊' }
          const isNegative = value < 0
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2 text-gs-text-muted">
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </span>
              <span className={`font-medium ${isNegative ? 'text-gs-success' : 'text-gs-text'}`}>
                {isNegative ? '' : '+'}{(value * 100).toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
