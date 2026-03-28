import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiError } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await loginUser(formData);
      navigate(location.state?.from || "/dashboard");
    } catch (requestError) {
      setError(getApiError(requestError, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="gs-shell flex min-h-[calc(100vh-88px)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <span className="gs-kicker">Demo-ready access</span>
          <h1 className="mt-6 text-4xl font-extrabold text-white">Step back into your rider risk dashboard.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Review your current cover, watch live risk scores, inspect claims, and track payouts from one workspace.
          </p>
          <div className="mt-8 rounded-3xl border border-teal-400/20 bg-teal-500/10 p-5 text-sm text-teal-100">
            Demo seed credentials after running `npm run seed` on the server:
            <div className="mt-3 space-y-2 text-slate-100">
              <p>arjun@gigshield.demo / Password@123</p>
              <p>priya@gigshield.demo / Password@123</p>
            </div>
          </div>
        </section>

        <section className="gs-card">
          <h2 className="text-2xl font-bold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-400">Use your worker credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="gs-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="gs-input" value={formData.email} onChange={handleChange} placeholder="arjun@gigshield.demo" />
            </div>
            <div>
              <label className="gs-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="gs-input" value={formData.password} onChange={handleChange} placeholder="Password@123" />
            </div>

            {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <button type="submit" className="gs-btn-primary w-full" disabled={submitting}>
              {submitting ? <LoadingSpinner label="Signing in" /> : "Enter dashboard"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Need a worker account? <Link to="/register" className="font-semibold text-teal-300">Register here</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
