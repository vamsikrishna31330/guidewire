import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import api, { getApiError } from "../utils/api";
import { formatCurrency, formatShortDate } from "../utils/formatters";

export default function Policy() {
  const [data, setData] = useState({ active_policy: null, policies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPolicies = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/policy/my");
      setData(response.data.data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load policy data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  if (loading) {
    return (
      <main className="gs-shell flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading policy details" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="gs-shell">
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">{error}</div>
      </main>
    );
  }

  return (
    <main className="gs-shell space-y-8">
      <section className="gs-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="gs-kicker">Policy management</span>
            <h1 className="mt-5 text-3xl font-extrabold text-white">Your active GigShield cover</h1>
          </div>
          {!data.active_policy ? <Link to="/get-quote" className="gs-btn-primary">Buy policy</Link> : null}
        </div>

        {data.active_policy ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Coverage type</p>
              <p className="mt-2 text-lg font-semibold text-white">{data.active_policy.coverage_type}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Premium paid</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(data.active_policy.weekly_premium)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Coverage period</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatShortDate(data.active_policy.start_date)} to {formatShortDate(data.active_policy.end_date)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Status</p>
              <div className="mt-3"><StatusBadge value={data.active_policy.status} /></div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-300">
            No active policy found. Run a live quote and activate cover for your zone.
          </div>
        )}
      </section>

      <section className="gs-card">
        <h2 className="text-2xl font-bold text-white">Policy history</h2>
        <div className="mt-6 space-y-4">
          {data.policies.length ? data.policies.map((policy) => (
            <div key={policy._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{policy.city} {policy.pincode}</p>
                  <p className="mt-1 text-sm text-slate-400">Coverage {formatCurrency(policy.coverage_amount)} | Payment {policy.payment_method}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge value={policy.status} />
                  <span className="text-sm text-slate-400">Risk {policy.risk_score}</span>
                </div>
              </div>
            </div>
          )) : <p className="text-sm text-slate-400">No policy history yet.</p>}
        </div>
      </section>
    </main>
  );
}
