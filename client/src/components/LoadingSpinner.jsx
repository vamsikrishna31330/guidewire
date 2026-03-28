export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400/60 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
