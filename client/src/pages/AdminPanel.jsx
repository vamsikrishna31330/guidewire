import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import api, { getApiError } from "../utils/api";
import { formatCurrency, formatDate, titleize } from "../utils/formatters";

const scoreTone = (score) => {
  if (score < 30) {
    return "active";
  }

  if (score <= 70) {
    return "pending_verification";
  }

  return "flagged_fraud";
};

export default function AdminPanel() {
  const [disruptions, setDisruptions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [curfewForm, setCurfewForm] = useState({ city: "Bengaluru", pincode: "560001" });

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [disruptionsResponse, claimsResponse] = await Promise.all([
        api.get("/api/admin/disruptions"),
        api.get("/api/admin/claims"),
      ]);
      setDisruptions(disruptionsResponse.data.data.disruptions);
      setClaims(claimsResponse.data.data.claims);
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
      await api.put(`/api/admin/claims/${claimId}`, { status });
      setMessage(`Claim ${status} successfully.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getApiError(requestError, `Unable to ${status} claim`));
    } finally {
      setActionLoading(false);
    }
  };

  const triggerCurfew = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/api/admin/trigger-curfew", curfewForm);
      setMessage("Curfew simulation triggered successfully.");
      await loadAdminData();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to trigger curfew"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="gs-shell flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading admin operations" />
      </main>
    );
  }

  return (
    <main className="gs-shell space-y-8">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="gs-card">
          <span className="gs-kicker">Admin panel</span>
          <h1 className="mt-5 text-3xl font-extrabold text-white">Disruption control room</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">Approve or reject claims, inspect fraud scores, and simulate civic curfews for demo scenarios.</p>

          <form onSubmit={triggerCurfew} className="mt-8 space-y-5">
            <div>
              <label className="gs-label" htmlFor="admin-city">City</label>
              <input id="admin-city" className="gs-input" value={curfewForm.city} onChange={(event) => setCurfewForm((current) => ({ ...current, city: event.target.value }))} />
            </div>
            <div>
              <label className="gs-label" htmlFor="admin-pincode">Pincode</label>
              <input id="admin-pincode" className="gs-input" value={curfewForm.pincode} onChange={(event) => setCurfewForm((current) => ({ ...current, pincode: event.target.value }))} />
            </div>
            {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
            <button type="submit" className="gs-btn-primary w-full" disabled={actionLoading}>
              {actionLoading ? <LoadingSpinner label="Processing admin action" /> : "Trigger curfew event"}
            </button>
          </form>
        </div>

        <div className="gs-card overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Active disruption events</h2>
            <button onClick={loadAdminData} className="gs-btn-secondary">Refresh</button>
          </div>
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
                {disruptions.map((event) => (
                  <tr key={event._id} className="border-t border-white/10 align-top">
                    <td className="py-4 pr-4 font-semibold text-white">{titleize(event.trigger_type)}</td>
                    <td className="py-4 pr-4">{event.city} {event.pincode}<div className="mt-1 text-xs text-slate-500">{formatDate(event.timestamp)}</div></td>
                    <td className="py-4 pr-4"><StatusBadge value={event.severity === "critical" ? "flagged_fraud" : "pending_verification"} /></td>
                    <td className="py-4">{event.affected_policies.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <th className="pb-4 pr-4">FCS</th>
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
                  <td className="py-4 pr-4">{formatCurrency(claim.amount)}</td>
                  <td className="py-4 pr-4"><StatusBadge value={scoreTone(claim.fcs_score)} className="min-w-[88px] justify-center" /> <span className="mt-2 block text-xs text-slate-400">{claim.fcs_score}</span></td>
                  <td className="py-4 pr-4"><StatusBadge value={claim.status} /></td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button className="gs-btn-primary !px-4 !py-2 text-sm" disabled={actionLoading} onClick={() => updateClaim(claim._id, "approved")}>
                        Approve
                      </button>
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
    </main>
  );
}
