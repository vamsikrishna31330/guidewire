import TriggerBadge from './TriggerBadge'

export default function ClaimCard({ claim }) {
  if (!claim) return null

  const statusStyles = {
    Pending: 'bg-gs-warning/10 text-gs-warning border-gs-warning/30',
    Verified: 'bg-gs-teal/10 text-gs-teal border-gs-teal/30',
    Paid: 'bg-gs-success/10 text-gs-success border-gs-success/30',
    Rejected: 'bg-gs-danger/10 text-gs-danger border-gs-danger/30',
  }

  return (
    <div className="gs-card" id={`claim-${claim.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <TriggerBadge type={claim.triggerType} />
          {claim.isAutomatic && (
            <span className="text-[10px] bg-gs-teal/10 text-gs-teal px-2 py-0.5 rounded-full font-medium">
              AUTO
            </span>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[claim.status] || ''}`}>
          {claim.status}
        </span>
      </div>

      <p className="text-sm text-gs-text-muted mb-2">{claim.triggerValue}</p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gs-text-muted">Zone {claim.pincode}</span>
        {claim.payoutAmount && (
          <span className="font-semibold text-gs-success">₹{claim.payoutAmount}</span>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gs-border/50 text-xs text-gs-text-muted">
        {claim.detectedAt
          ? `Detected: ${new Date(claim.detectedAt).toLocaleString()}`
          : `Filed: ${new Date(claim.createdAt).toLocaleString()}`
        }
      </div>
    </div>
  )
}
