import LogoMark from "@/components/LogoMark";

// Shown while a page loads: the logo with its seconds hand sweeping fast, instead of a spinner.
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <LogoMark className="h-24 w-24 drop-shadow-[0_10px_30px_rgba(59,130,246,0.35)]" secondsPerTurn={1.6} syncToClock={false} />
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Loading…</p>
    </div>
  );
}
