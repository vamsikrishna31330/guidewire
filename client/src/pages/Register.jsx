import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiError } from "../utils/api";

const platforms = ["Zomato", "Swiggy", "Zepto", "Blinkit", "Other"];

export default function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    pincode: "",
    platform: "Swiggy",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registerUser(formData);
      navigate("/dashboard");
    } catch (requestError) {
      setError(getApiError(requestError, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="gs-shell flex min-h-[calc(100vh-88px)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-teal-400/15 bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900 p-8">
          <span className="gs-kicker">Worker onboarding</span>
          <h1 className="mt-6 text-4xl font-extrabold text-white">Start your GigShield protection in one setup.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            We use your delivery zone, city, and platform to price risk, activate coverage, and monitor disruption triggers.
          </p>
          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Weekly cover quotes tailored to your city and pincode.</div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Claims history, notifications, and payouts available right after login.</div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Fallback demo data keeps the experience working even without live API keys.</div>
          </div>
        </section>

        <section className="gs-card">
          <h2 className="text-2xl font-bold text-white">Create worker account</h2>
          <p className="mt-2 text-sm text-slate-400">Register as a delivery partner to access the dashboard and buy a policy.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="gs-label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="gs-input" value={formData.name} onChange={handleChange} placeholder="Rider name" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="gs-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="gs-input" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              <div>
                <label className="gs-label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" className="gs-input" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="gs-label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" className="gs-input" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
              </div>
              <div>
                <label className="gs-label" htmlFor="platform">Platform</label>
                <select id="platform" name="platform" className="gs-input" value={formData.platform} onChange={handleChange}>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="gs-label" htmlFor="city">City</label>
                <input id="city" name="city" className="gs-input" value={formData.city} onChange={handleChange} placeholder="Bengaluru" />
              </div>
              <div>
                <label className="gs-label" htmlFor="pincode">Pincode</label>
                <input id="pincode" name="pincode" className="gs-input" value={formData.pincode} onChange={handleChange} placeholder="560001" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <button type="submit" className="gs-btn-primary w-full" disabled={submitting}>
              {submitting ? <LoadingSpinner label="Creating account" /> : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already registered? <Link to="/login" className="font-semibold text-teal-300">Sign in here</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
