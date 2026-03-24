import TriggerBadge from './TriggerBadge'

export default function PolicyCard({ policy }) {
  if (!policy) return null

  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  ))

  const statusColor = {
    Active: 'gs-badge-success',
    Expired: 'gs-badge-danger',
    Paused: 'gs-badge-warning',
  }

  return (
    <div className="gs-card relative overflow-hidden group" id={`policy-${policy.id}`}>
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gs-teal to-emerald-400" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gs-text">Zone {policy.pincode}</h3>
          <p className="text-sm text-gs-text-muted">Risk Score: {policy.riskScore}/100</p>
        </div>
        <span className={statusColor[policy.status] || 'gs-badge-teal'}>
          {policy.status}
        </span>
      </div>

      {/* Coverage types */}
      <div className="flex flex-wrap gap-2 mb-4">
        {policy.coverageTypes?.map(type => (
          <TriggerBadge key={type} type={type} />
        ))}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gs-bg/50 rounded-lg p-3">
          <p className="text-gs-text-muted text-xs mb-1">Premium</p>
          <p className="font-semibold text-gs-teal">₹{policy.weeklyPremium}/week</p>
        </div>
        <div className="bg-gs-bg/50 rounded-lg p-3">
          <p className="text-gs-text-muted text-xs mb-1">Days Left</p>
          <p className={`font-semibold ${daysRemaining <= 2 ? 'text-gs-warning' : 'text-gs-text'}`}>
            {daysRemaining} days
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 pt-3 border-t border-gs-border text-xs text-gs-text-muted flex justify-between">
        <span>Start: {new Date(policy.startDate).toLocaleDateString()}</span>
        <span>End: {new Date(policy.endDate).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
