import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../utils/api";
import { formatCurrency } from "../utils/formatters";

export default function GetQuote() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    city: user?.city || "",
    pincode: user?.pincode || "",
    payment_method: "UPI",
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleQuote = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/api/policy/quote", {
        params: {
          city: formData.city,
          pincode: formData.pincode,
        },
      });
      setQuote(response.data.data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to fetch quote"));
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!quote) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/get-quote" } });
      return;
    }

    setBuying(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/policy/purchase", {
        workerId: user._id,
        city: quote.city,
        pincode: quote.pincode,
        platform: user.platform,
        weekly_premium: quote.weekly_premium,
        coverage_amount: quote.coverage_amount,
        payment_method: formData.payment_method,
      });
      setSuccess("Policy purchased successfully. Your cover is now active.");
      navigate("/policy");
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to purchase policy"));
    } finally {
      setBuying(false);
    }
  };

  return (
    <main className="gs-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="gs-card">
        <span className="gs-kicker">Premium calculator</span>
        <h1 className="mt-5 text-3xl font-extrabold text-white">Live quote for your delivery zone.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          GigShield combines rainfall, wind speed, AQI, and a base operating score to price a weekly parametric cover for your city and pincode.
        </p>

        <form onSubmit={handleQuote} className="mt-8 space-y-5">
          <div>
            <label className="gs-label" htmlFor="city">City</label>
            <input id="city" name="city" className="gs-input" value={formData.city} onChange={handleChange} placeholder="Mumbai" />
          </div>
          <div>
            <label className="gs-label" htmlFor="pincode">Pincode</label>
            <input id="pincode" name="pincode" className="gs-input" value={formData.pincode} onChange={handleChange} placeholder="400001" />
          </div>
          <div>
            <label className="gs-label" htmlFor="payment_method">Payment method</label>
            <select id="payment_method" name="payment_method" className="gs-input" value={formData.payment_method} onChange={handleChange}>
              <option value="UPI">UPI</option>
              <option value="Wallet">Wallet</option>
              <option value="Card">Card</option>
              <option value="Netbanking">Netbanking</option>
            </select>
          </div>

          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

          <button type="submit" className="gs-btn-primary w-full" disabled={loading}>
            {loading ? <LoadingSpinner label="Fetching live quote" /> : "Get quote"}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <h2 className="text-2xl font-bold text-white">Quote breakdown</h2>
        {!quote ? (
          <p className="mt-6 text-sm leading-7 text-slate-400">Run the calculator to see the risk score, live conditions, trigger watchlist, and coverage amount.</p>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="gs-card !p-5">
                <p className="text-sm text-slate-400">Risk score</p>
                <p className="mt-3 text-4xl font-extrabold text-white">{quote.risk_score}</p>
              </div>
              <div className="gs-card !p-5">
                <p className="text-sm text-slate-400">Weekly premium</p>
                <p className="mt-3 text-4xl font-extrabold text-white">{formatCurrency(quote.weekly_premium)}</p>
              </div>
            </div>

            <div className="gs-card !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Coverage amount</p>
                  <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(quote.coverage_amount)}</p>
                </div>
                <StatusBadge value={quote.live_conditions.sources.weather === "live" ? "active" : "pending_verification"} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Rain {quote.live_conditions.rain_mm} mm/hr</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Wind {quote.live_conditions.wind_speed} km/h</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Temp {quote.live_conditions.temperature} C</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">AQI {quote.live_conditions.aqi}</div>
              </div>
            </div>

            <div className="gs-card !p-5">
              <p className="text-sm text-slate-400">Disruption triggers covered</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {quote.disruption_triggers.map((trigger) => (
                  <span key={trigger.type} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    {trigger.label}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={handleBuy} className="gs-btn-primary w-full" disabled={buying}>
              {buying ? <LoadingSpinner label="Activating policy" /> : isAuthenticated ? "Buy this policy" : "Login to buy policy"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
