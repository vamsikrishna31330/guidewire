import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiCloud, FiShield, FiZap } from "react-icons/fi";
import api from "../utils/api";
import { formatCurrency } from "../utils/formatters";

const steps = [
  {
    title: "Enroll in minutes",
    description: "Delivery partners sign up with their city, pincode, and platform to get covered instantly.",
    icon: FiShield,
  },
  {
    title: "GigShield watches the zone",
    description: "Weather, AQI, and curfew signals are monitored every 30 minutes for active policy clusters.",
    icon: FiCloud,
  },
  {
    title: "Claims and payouts move fast",
    description: "Parametric triggers raise claims automatically and approved payouts land without paperwork loops.",
    icon: FiZap,
  },
];

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
};

export default function Landing() {
  const [impact, setImpact] = useState({
    activePoliciesCount: 0,
    totalPayouts: 0,
    citiesCovered: 0,
  });
  const livesProtected = useCountUp(impact.activePoliciesCount);
  const payoutsDisbursed = useCountUp(impact.totalPayouts);
  const citiesCovered = useCountUp(impact.citiesCovered);

  useEffect(() => {
    const loadImpact = async () => {
      try {
        const response = await api.get("/api/admin/stats");
        setImpact(response.data.data.totals);
      } catch (error) {
        setImpact({
          activePoliciesCount: 2,
          totalPayouts: 2152,
          citiesCovered: 2,
        });
      }
    };

    loadImpact();
  }, []);

  return (
    <main>
      <section className="gs-shell pb-16 pt-10 sm:pb-24 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="gs-kicker">Guidewire DEVTrails 2026 | Phase 3 Soar</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              AI-powered parametric insurance designed for India&apos;s delivery workforce.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              GigShield protects gig workers against weather shocks, hazardous air, and civic disruptions with live risk pricing,
              automated trigger detection, fraud-aware verification, and payout-ready claims workflows.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="gs-btn-primary gap-2">
                Get Protected <FiArrowRight />
              </Link>
              <Link to="/get-quote" className="gs-btn-secondary">
                Calculate Live Premium
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="gs-card !p-4">
                <p className="text-3xl font-extrabold text-white">{livesProtected}</p>
                <p className="mt-2 text-sm text-slate-300">Lives protected</p>
              </div>
              <div className="gs-card !p-4">
                <p className="text-3xl font-extrabold text-white">{formatCurrency(payoutsDisbursed)}</p>
                <p className="mt-2 text-sm text-slate-300">Total payouts disbursed</p>
              </div>
              <div className="gs-card !p-4">
                <p className="text-3xl font-extrabold text-white">{citiesCovered}</p>
                <p className="mt-2 text-sm text-slate-300">Cities and pincodes covered</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-teal-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 shadow-2xl shadow-teal-900/20">
            <div className="absolute -right-10 top-10 h-36 w-36 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-5">
                <div>
                  <p className="text-sm text-slate-400">Live Zone Risk</p>
                  <p className="mt-1 text-3xl font-extrabold text-white">74.8</p>
                </div>
                <div className="rounded-2xl bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200">Monsoon spike</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm text-slate-400">AQI trigger watch</p>
                  <p className="mt-3 text-2xl font-bold text-white">AQI 318</p>
                  <p className="mt-2 text-sm text-slate-400">Auto-claims queue opened for affected riders</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm text-slate-400">FCS integrity layer</p>
                  <p className="mt-3 text-2xl font-bold text-white">Verified</p>
                  <p className="mt-2 text-sm text-slate-400">Fraud-aware payout decisions before settlement</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3 text-teal-200">
                  <FiActivity />
                  <p className="font-semibold">Claims and payouts stay explainable</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Fraud confidence scoring, event logs, Razorpay test payouts, and policy-linked payout trails make GigShield Phase 3 demo-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gs-shell pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="gs-kicker">How it works</span>
            <h2 className="mt-4 text-3xl font-bold text-white">Three steps from registration to payout.</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="gs-card relative overflow-hidden">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-400/10 blur-2xl" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-2xl text-teal-200">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
