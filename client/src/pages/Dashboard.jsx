import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiBell, FiCreditCard, FiMapPin, FiShield } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import api, { getApiError } from "../utils/api";
import { formatCurrency, formatDate, formatShortDate, titleize } from "../utils/formatters";

const StatCard = ({ label, value, subtext, icon }) => (
  <div className="gs-card !p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
        {subtext ? <p className="mt-2 text-sm text-slate-400">{subtext}</p> : null}
      </div>
      <div className="rounded-2xl bg-teal-500/10 p-3 text-xl text-teal-200">{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityTab, setActivityTab] = useState("claims");

  const loadSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/dashboard/summary");
      setSummary(response.data.data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <main className="gs-shell flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading worker dashboard" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="gs-shell">
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
          <p className="font-semibold">Dashboard unavailable</p>
          <p className="mt-2 text-sm">{error}</p>
          <button onClick={loadSummary} className="gs-btn-secondary mt-5">Try again</button>
        </div>
      </main>
    );
  }

  const { worker, active_policy, claims, paid_claims, payouts, notifications, renewal, risk_snapshot } = summary;
  const totalPaid = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const payoutClaims = paid_claims?.length ? paid_claims : claims.filter((claim) => ["Paid", "approved", "auto_approved", "Verified"].includes(claim.status));

  return (
    <main className="gs-shell space-y-8">
      <section className="grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="gs-kicker">Worker command center</span>
          <h1 className="mt-6 text-4xl font-extrabold text-white">{worker.name}, your cover is tracking zone risk live.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            GigShield is currently monitoring {worker.city} {worker.pincode} for rainfall, heat, AQI, and wind disruption triggers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{worker.platform}</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Payout balance {formatCurrency(worker.payout_balance)}</div>
          </div>
          {renewal?.showReminder ? (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-100">
              Your policy expires in {renewal.daysUntilExpiry} day{renewal.daysUntilExpiry === 1 ? "" : "s"}. Renew now to stay covered.
            </div>
          ) : null}
        </div>
        <div className="gs-card !bg-black/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Current zone risk score</p>
              <p className="mt-2 text-5xl font-extrabold text-white">{risk_snapshot.risk_score}</p>
            </div>
            <StatusBadge value={risk_snapshot.risk_score > 70 ? "pending_verification" : "active"} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Rain {risk_snapshot.live_conditions.rain_mm} mm/hr</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Wind {risk_snapshot.live_conditions.wind_speed} km/h</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Temp {risk_snapshot.live_conditions.temperature} C</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">AQI {risk_snapshot.live_conditions.aqi}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Weekly premium" value={formatCurrency(risk_snapshot.weekly_premium)} subtext="Live quote for your zone" icon={<FiShield />} />
        <StatCard label="Earnings protected this week" value={formatCurrency(active_policy?.coverage_amount || risk_snapshot.coverage_amount)} subtext="Active coverage amount" icon={<FiCreditCard />} />
        <StatCard label="Claims filed" value={claims.length} subtext="Manual and auto-triggered" icon={<FiActivity />} />
        <StatCard label="Payouts completed" value={formatCurrency(totalPaid)} subtext={`${payouts.length} payout records`} icon={<FiBell />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <article className="gs-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Active policy</p>
                <h2 className="mt-1 text-2xl font-bold text-white">{active_policy ? active_policy.coverage_type : "No active policy yet"}</h2>
              </div>
              {active_policy ? <StatusBadge value={active_policy.status} /> : <Link to="/get-quote" className="gs-btn-primary">Buy cover</Link>}
            </div>
            {active_policy ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Premium paid</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(active_policy.weekly_premium)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Coverage window</p>
                  <p className="mt-2 text-sm font-semibold text-white">{formatShortDate(active_policy.start_date)} to {formatShortDate(active_policy.end_date)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-300">Calculate a live quote and activate cover for your zone in less than a minute.</p>
            )}
          </article>

          <article className="gs-card">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">{activityTab === "claims" ? "Recent claims" : "Payout history"}</h2>
              <Link to="/claims" className="text-sm font-semibold text-teal-300">Manage claims</Link>
            </div>
            <div className="mt-5 flex rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
              <button
                className={`flex-1 rounded-xl px-4 py-2 font-semibold ${activityTab === "claims" ? "bg-teal-500 text-slate-950" : "text-slate-300"}`}
                onClick={() => setActivityTab("claims")}
              >
                Claims
              </button>
              <button
                className={`flex-1 rounded-xl px-4 py-2 font-semibold ${activityTab === "payouts" ? "bg-teal-500 text-slate-950" : "text-slate-300"}`}
                onClick={() => setActivityTab("payouts")}
              >
                Payout History
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {activityTab === "claims" && claims.length ? claims.slice(0, 4).map((claim) => (
                <div key={claim._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{titleize(claim.disruption_type)}</p>
                      <p className="mt-1 text-sm text-slate-400">{claim.description}</p>
                    </div>
                    <StatusBadge value={claim.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                    <span>{formatDate(claim.createdAt)}</span>
                    <span>Amount {formatCurrency(claim.amount)}</span>
                  </div>
                  {["Pending", "Flagged", "pending_verification", "flagged_fraud"].includes(claim.status) || ["Pending", "Flagged"].includes(claim.fcsDecision) ? (
                    <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      Your claim is under verification. You'll hear back within 2 hours.
                    </div>
                  ) : null}
                </div>
              )) : null}
              {activityTab === "payouts" && payoutClaims.length ? payoutClaims.map((claim) => (
                <div key={claim._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{titleize(claim.disruption_type)}</p>
                      <p className="mt-1 text-sm text-slate-400">Payout received on {formatDate(claim.updatedAt || claim.createdAt)}</p>
                    </div>
                    <p className="text-xl font-extrabold text-emerald-300">{formatCurrency(claim.payoutAmount || claim.amount)}</p>
                  </div>
                </div>
              )) : null}
              {activityTab === "claims" && !claims.length ? <p className="text-sm text-slate-400">No claims filed yet.</p> : null}
              {activityTab === "payouts" && !payoutClaims.length ? <p className="text-sm text-slate-400">No paid claims yet.</p> : null}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="gs-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-200"><FiMapPin /></div>
              <div>
                <p className="text-sm text-slate-400">Risk engine sources</p>
                <p className="text-base font-semibold text-white">Weather: {risk_snapshot.live_conditions.sources.weather} | AQI: {risk_snapshot.live_conditions.sources.aqi}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {risk_snapshot.disruption_triggers.map((trigger) => (
                <div key={trigger.type} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {trigger.label}
                </div>
              ))}
            </div>
          </article>

          <article className="gs-card">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <div className="mt-6 space-y-4">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge value={notification.read ? "completed" : "unread"} />
                    <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{notification.message}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No notifications yet.</p>}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
