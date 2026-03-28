const palette = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  expired: "bg-slate-500/15 text-slate-300 border-slate-400/20",
  auto_approved: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  pending_verification: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  flagged_fraud: "bg-rose-500/15 text-rose-300 border-rose-400/20",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-400/20",
  completed: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  unread: "bg-teal-500/15 text-teal-300 border-teal-400/20",
};

export default function StatusBadge({ value, className = "" }) {
  const normalized = (value || "").toLowerCase();
  const tone = palette[normalized] || "bg-white/10 text-slate-200 border-white/10";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone} ${className}`}>
      {String(value || "Unknown").replaceAll("_", " ")}
    </span>
  );
}
