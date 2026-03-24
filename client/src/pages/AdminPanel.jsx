import { useState, useEffect } from 'react'
import api from '../utils/api'
import TriggerBadge from '../components/TriggerBadge'
import { HiShieldCheck, HiDocumentText, HiCurrencyRupee, HiClock } from 'react-icons/hi'

const PINCODES = ['500001','600001','400001','110001','560001','700001','411001','530001','522001','521001']

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [claims, setClaims] = useState([])
  const [disruptions, setDisruptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggerForm, setTriggerForm] = useState({ pincode: '500001', triggerType: 'curfew' })
  const [triggerLoading, setTriggerLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [s, c, d] = await Promise.all([
        api.get('/api/admin/stats').catch(() => ({ data: {} })),
        api.get('/api/claims/all').catch(() => ({ data: [] })),
        api.get('/api/admin/disruptions').catch(() => ({ data: [] })),
      ])
      setStats(s.data)
      setClaims(c.data)
      setDisruptions(d.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const updateClaimStatus = async (id, status) => {
    try {
      await api.put(`/api/claims/${id}/status`, { status })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const fireTrigger = async () => {
    setTriggerLoading(true)
    try {
      await api.post('/api/triggers/manual', triggerForm)
      fetchData()
    } catch (err) { console.error(err) }
    setTriggerLoading(false)
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse space-y-6"><div className="h-8 bg-gs-border rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-24 bg-gs-card rounded-xl"/>)}</div></div></div>

  const statCards = [
    { icon: HiShieldCheck, label: 'Active Policies', value: stats?.activePolicies || 0, color: 'text-gs-teal' },
    { icon: HiDocumentText, label: 'Total Claims', value: stats?.totalClaims || 0, color: 'text-gs-warning' },
    { icon: HiCurrencyRupee, label: 'Total Payout', value: `₹${stats?.totalPayout || 0}`, color: 'text-gs-success' },
    { icon: HiClock, label: 'Pending Reviews', value: stats?.pendingClaims || 0, color: 'text-gs-danger' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in" id="admin-panel">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="gs-card !p-4">
            <s.icon className={`w-8 h-8 ${s.color} mb-2`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gs-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claims Table */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">All Claims</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gs-border text-gs-text-muted text-left">
                <th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4">Pincode</th><th className="pb-3 pr-4">Payout</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Action</th>
              </tr></thead>
              <tbody>
                {claims.slice(0, 20).map(c => (
                  <tr key={c.id} className="border-b border-gs-border/50">
                    <td className="py-3 pr-4"><TriggerBadge type={c.triggerType} /></td>
                    <td className="py-3 pr-4">{c.pincode}</td>
                    <td className="py-3 pr-4 text-gs-success">₹{c.payoutAmount}</td>
                    <td className="py-3 pr-4"><span className={`gs-badge ${c.status==='Paid'?'gs-badge-success':c.status==='Pending'?'gs-badge-warning':c.status==='Rejected'?'gs-badge-danger':'gs-badge-teal'}`}>{c.status}</span></td>
                    <td className="py-3">
                      {c.status !== 'Paid' && c.status !== 'Rejected' && (
                        <select className="gs-select !py-1 !px-2 text-xs !w-auto" value="" onChange={(e) => {if(e.target.value) updateClaimStatus(c.id, e.target.value)}}>
                          <option value="">Update</option>
                          <option value="Verified">Verify</option>
                          <option value="Paid">Pay</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Trigger + Disruptions */}
        <div className="space-y-6">
          <div className="gs-card">
            <h3 className="font-semibold mb-3">🔥 Manual Trigger</h3>
            <div className="space-y-3">
              <select className="gs-select" value={triggerForm.triggerType} onChange={(e) => setTriggerForm(p => ({...p, triggerType: e.target.value}))}>
                <option value="curfew">Curfew</option>
                <option value="flood">Flood</option>
              </select>
              <select className="gs-select" value={triggerForm.pincode} onChange={(e) => setTriggerForm(p => ({...p, pincode: e.target.value}))}>
                {PINCODES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={fireTrigger} disabled={triggerLoading} className="w-full gs-btn-danger !py-2.5">{triggerLoading ? 'Firing...' : '🔥 Fire Trigger'}</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recent Disruptions</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {disruptions.slice(0, 10).map(d => (
                <div key={d.id} className="gs-card !p-3">
                  <div className="flex items-center justify-between mb-1">
                    <TriggerBadge type={d.triggerType} />
                    <span className="text-[10px] text-gs-text-muted">{new Date(d.detectedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gs-text-muted">{d.triggerValue}</p>
                  <p className="text-xs text-gs-text-muted mt-1">Zone {d.pincode} • {d.claimsCreated} claims</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
