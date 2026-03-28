import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import api, { getApiError } from "../utils/api";
import { formatCurrency, formatDate, titleize } from "../utils/formatters";

const disruptionOptions = [
  "HEAVY_RAIN",
  "EXTREME_HEAT",
  "POOR_AIR_QUALITY",
  "HIGH_WIND_SPEED",
  "SIMULATED_CURFEW",
];

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [activePolicy, setActivePolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    disruption_type: "HEAVY_RAIN",
    description: "",
    location_proof: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [claimsResponse, policyResponse] = await Promise.all([
        api.get("/api/claims/my"),
        api.get("/api/policy/my"),
      ]);
      setClaims(claimsResponse.data.data.claims);
      setActivePolicy(policyResponse.data.data.active_policy);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load claims"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activePolicy) {
      setError("An active policy is required before you can submit a manual claim.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/claims/submit", {
        policy_id: activePolicy._id,
        ...formData,
      });
      setSuccess("Claim submitted successfully.");
      setFormData({ disruption_type: "HEAVY_RAIN", description: "", location_proof: "" });
      await loadData();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to submit claim"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="gs-shell flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading claims workspace" />
      </main>
    );
  }

  return (
    <main className="gs-shell grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="gs-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="gs-kicker">Claims management</span>
            <h1 className="mt-5 text-3xl font-extrabold text-white">Claims history and verification status</h1>
          </div>
          {activePolicy ? <StatusBadge value={activePolicy.status} /> : null}
        </div>

        <div className="mt-8 space-y-4">
          {claims.length ? claims.map((claim) => (
            <div key={claim._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{titleize(claim.disruption_type)}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{claim.description}</p>
                </div>
                <StatusBadge value={claim.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{formatDate(claim.createdAt)}</span>
                <span>Amount {formatCurrency(claim.amount)}</span>
                <span>FCS {claim.fcs_score}</span>
                <span>{claim.auto_triggered ? "Auto-triggered" : "Manual"}</span>
              </div>
            </div>
          )) : <p className="text-sm text-slate-400">No claims filed yet.</p>}
        </div>
      </section>

      <section className="gs-card h-fit">
        <h2 className="text-2xl font-bold text-white">Submit manual claim</h2>
        <p className="mt-2 text-sm text-slate-400">Manual claims run through the Fraud Confidence Score engine automatically.</p>

        {activePolicy ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Active policy for {activePolicy.city} {activePolicy.pincode} | Coverage {formatCurrency(activePolicy.coverage_amount)}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            Buy an active policy first to unlock manual claim submission.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="gs-label" htmlFor="disruption_type">Disruption type</label>
            <select id="disruption_type" name="disruption_type" className="gs-input" value={formData.disruption_type} onChange={handleChange}>
              {disruptionOptions.map((option) => (
                <option key={option} value={option}>{titleize(option)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gs-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="4" className="gs-input" value={formData.description} onChange={handleChange} placeholder="What disruption affected your deliveries?" />
          </div>
          <div>
            <label className="gs-label" htmlFor="location_proof">Location proof</label>
            <textarea id="location_proof" name="location_proof" rows="4" className="gs-input" value={formData.location_proof} onChange={handleChange} placeholder="Describe the evidence or text proof you have" />
          </div>

          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

          <button type="submit" className="gs-btn-primary w-full" disabled={submitting || !activePolicy}>
            {submitting ? <LoadingSpinner label="Submitting claim" /> : "Submit claim"}
          </button>
        </form>
      </section>
    </main>
  );
}
