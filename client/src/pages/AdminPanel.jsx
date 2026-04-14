import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingSpinner from "../components/LoadingSpinner";
import RazorpayButton from "../components/RazorpayButton";
import StatusBadge from "../components/StatusBadge";
import api, { getApiError } from "../utils/api";
import { formatCurrency, formatDate, titleize } from "../utils/formatters";

const statusColors = ["#14b8a6", "#f59e0b", "#ef4444", "#38bdf8"];

const riskTone = {
  High: "flagged",
  Medium: "pending",
  Low: "verified",
};

const StatCard = ({ label, value, subtext }) => (
  <div className="gs-card !p-5">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
    {subtext ? <p className="mt-2 text-xs text-slate-400">{subtext}</p> : null}
  </div>
);

const ChartCard = ({ title, children }) => (
  <section className="gs-card min-h-[340px]">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="mt-6 h-64">{children}</div>
  </section>
);

const formatBreakdown = (breakdown = {}) =>
  Object.entries(breakdown)
    .filter(([, value]) => value?.risk)
    .map(([key, value]) => `${titleize(key)}: +${value.points}`)
    .join(", ") || "No high-risk signals";

export default function AdminPanel() {
  const [disruptions, setDisruptions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [triggerForm, setTriggerForm] = useState({
    city: "Bengaluru",
    pincode: "560001",
    trigger_type: "HEAVY_RAIN",
    severity: "high",
  });

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [disruptionsResponse, claimsResponse, statsResponse] = await Promise.all([
        api.get("/api/admin/disruptions"),
        api.get("/api/admin/claims"),
        api.get("/api/admin/stats"),
      ]);
      setDisruptions(disruptionsResponse.data.data.disruptions);
      setClaims(claimsResponse.data.data.claims);
      setStats(statsResponse.data.data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const updateClaim = async (claimId, status) => {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put(`/api/admin/claims/${claimId}`, { status });
      setMessage(response.data.data.message || `Claim ${status} successfully.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getApiError(requestError, `Unable to ${status} claim`));
    } finally {
      setActionLoading(false);
    }
  };

  const triggerEvent = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/api/admin/trigger-event", triggerForm);
      setMessage(`${titleize(triggerForm.trigger_type)} disruption simulated successfully.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to trigger disruption"));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayoutSuccess = async () => {
    setMessage("Payout Processed");
    await loadAdminData();
  };

  if (loading) {
    return (
      <main className="gs-shell flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading insurer command center" />
      </main>
    );
  }

  const flaggedClaims = stats?.flaggedClaims || [];

  return (
    <main className="gs-shell space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="gs-kicker">Phase 3 insurer dashboard</span>
            <h1 className="mt-5 text-4xl font-extrabold text-white">GigShield risk, fraud, and payout cockpit</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Monitor exposure, loss ratio, fraud signals, zone-level premium and payout trends, and next-week pincode risk forecasts.
            </p>
          </div>
          <button onClick={loadAdminData} className="gs-btn-secondary">Refresh data</button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Exposure" value={formatCurrency(stats?.totals.totalExposure)} subtext="Active policy coverage amount" />
        <StatCard label="Loss Ratio" value={`${stats?.totals.lossRatio.toFixed(1)}%`} subtext="Payouts / premiums collected" />
        <StatCard label="Fraud Rate" value={`${stats?.totals.fraudRate.toFixed(1)}%`} subtext="Flagged claims / total claims" />
        <StatCard label="Avg FCS Score" value={stats?.totals.avgFcsScore.toFixed(1)} subtext="Across all claims" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Claims per day - last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.charts.claimsPerDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
              <Line type="monotone" dataKey="claims" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Premiums vs payouts by zone">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.charts.zoneFinancials || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="zone" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
              <Bar dataKey="premiums" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="payouts" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Claim status distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats?.charts.statusDistribution || []} dataKey="value" nameKey="name" outerRadius={95} label>
                {(stats?.charts.statusDistribution || []).map((entry, index) => (
                  <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="gs-card">
          <h2 className="text-2xl font-bold text-white">Manual disruption trigger</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Use this during the demo to fire a Heavy Rain event for a worker pincode and auto-create affected claims.
          </p>
          <form onSubmit={triggerEvent} className="mt-8 space-y-5">
            <div>
              <label className="gs-label" htmlFor="admin-city">City</label>
              <input id="admin-city" className="gs-input" value={triggerForm.city} onChange={(event) => setTriggerForm((current) => ({ ...current, city: event.target.value }))} />
            </div>
            <div>
              <label className="gs-label" htmlFor="admin-pincode">Pincode</label>
              <input id="admin-pincode" className="gs-input" value={triggerForm.pincode} onChange={(event) => setTriggerForm((current) => ({ ...current, pincode: event.target.value }))} />
            </div>
            <div>
              <label className="gs-label" htmlFor="trigger-type">Trigger type</label>
              <select id="trigger-type" className="gs-input" value={triggerForm.trigger_type} onChange={(event) => setTriggerForm((current) => ({ ...current, trigger_type: event.target.value }))}>
                <option value="HEAVY_RAIN">Heavy Rain</option>
                <option value="EXTREME_HEAT">Extreme Heat</option>
                <option value="POOR_AIR_QUALITY">Poor Air Quality</option>
                <option value="HIGH_WIND_SPEED">High Wind Speed</option>
                <option value="SIMULATED_CURFEW">Simulated Curfew</option>
              </select>
            </div>
            {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
            <button type="submit" className="gs-btn-primary w-full" disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Fire disruption trigger"}
            </button>
          </form>
        </div>

        <div className="gs-card overflow-hidden">
          <h2 className="text-2xl font-bold text-white">Next-week risk forecast</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(stats?.forecast || []).map((zone) => (
              <div key={zone.pincode} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{zone.city} {zone.pincode}</p>
                    <p className="mt-1 text-xs text-slate-400">Risk score {zone.riskScore} | AQI {zone.aqi} | Rain {zone.rain_mm} mm</p>
                  </div>
                  <StatusBadge value={riskTone[zone.riskLevel]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gs-card overflow-hidden">
        <h2 className="text-2xl font-bold text-white">Flagged claims queue</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.25em] text-slate-500">
              <tr>
                <th className="pb-4 pr-4">Worker</th>
                <th className="pb-4 pr-4">Zone</th>
                <th className="pb-4 pr-4">Trigger</th>
                <th className="pb-4 pr-4">FCS</th>
                <th className="pb-4 pr-4">Breakdown</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedClaims.length ? flaggedClaims.map((claim) => (
                <tr key={claim._id} className="border-t border-white/10 align-top">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-white">{claim.worker_id?.name || "Worker"}</p>
                    <p className="mt-1 text-xs text-slate-500">{claim.worker_id?.email}</p>
                  </td>
                  <td className="py-4 pr-4">{claim.policy_id?.city} {claim.claimed_pincode || claim.policy_id?.pincode}</td>
                  <td className="py-4 pr-4">{titleize(claim.disruption_type)}</td>
                  <td className="py-4 pr-4"><StatusBadge value="flagged" /> <span className="mt-2 block text-xs">{claim.fcsScore ?? claim.fcs_score}</span></td>
                  <td className="max-w-xs py-4 pr-4 text-xs leading-6 text-slate-400">{formatBreakdown(claim.fcsBreakdown)}</td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2">
                      <RazorpayButton claim={claim} override onSuccess={handlePayoutSuccess} onError={setError}>
                        Override & Pay
                      </RazorpayButton>
                      <button className="gs-btn-secondary !px-4 !py-2 text-sm" disabled={actionLoading} onClick={() => updateClaim(claim._id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="border-t border-white/10 py-6 text-center text-slate-400">No flagged claims right now.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gs-card overflow-hidden">
        <h2 className="text-2xl font-bold text-white">All claims with FCS scoring</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.25em] text-slate-500">
              <tr>
                <th className="pb-4 pr-4">Worker</th>
                <th className="pb-4 pr-4">Disruption</th>
                <th className="pb-4 pr-4">Amount</th>
                <th className="pb-4 pr-4">FCS Decision</th>
                <th className="pb-4 pr-4">Status</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} className="border-t border-white/10 align-top">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-white">{claim.worker_id?.name || "Worker"}</p>
                    <p className="mt-1 text-xs text-slate-500">{claim.worker_id?.city} {claim.worker_id?.pincode}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <p>{titleize(claim.disruption_type)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(claim.createdAt)}</p>
                  </td>
                  <td className="py-4 pr-4">{formatCurrency(claim.payoutAmount || claim.amount)}</td>
                  <td className="py-4 pr-4"><StatusBadge value={claim.fcsDecision || "Pending"} /> <span className="mt-2 block text-xs text-slate-400">{claim.fcsScore ?? claim.fcs_score}</span></td>
                  <td className="py-4 pr-4"><StatusBadge value={claim.status} /></td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <RazorpayButton claim={claim} onSuccess={handlePayoutSuccess} onError={setError}>
                        Approve & Pay
                      </RazorpayButton>
                      <button className="gs-btn-secondary !px-4 !py-2 text-sm" disabled={actionLoading} onClick={() => updateClaim(claim._id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gs-card overflow-hidden">
        <h2 className="text-2xl font-bold text-white">Recent disruption events</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.25em] text-slate-500">
              <tr>
                <th className="pb-4 pr-4">Trigger</th>
                <th className="pb-4 pr-4">Zone</th>
                <th className="pb-4 pr-4">Severity</th>
                <th className="pb-4">Affected</th>
              </tr>
            </thead>
            <tbody>
              {disruptions.slice(0, 8).map((event) => (
                <tr key={event._id} className="border-t border-white/10 align-top">
                  <td className="py-4 pr-4 font-semibold text-white">{titleize(event.trigger_type)}</td>
                  <td className="py-4 pr-4">{event.city} {event.pincode}<div className="mt-1 text-xs text-slate-500">{formatDate(event.timestamp)}</div></td>
                  <td className="py-4 pr-4"><StatusBadge value={event.severity === "critical" ? "flagged" : "pending"} /></td>
                  <td className="py-4">{event.affected_policies.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
