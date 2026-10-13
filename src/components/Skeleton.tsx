// Soft shimmering placeholders shown while content loads, shaped like what's coming.
const bar = "bb-skeleton rounded-full";

export function SkeletonCards({ count = 3, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-hairline bg-raised shadow-card">
          <div className="bb-skeleton h-[220px] md:h-64" />
          <div className="space-y-3 p-6">
            <div className={`${bar} h-3 w-24`} />
            <div className={`${bar} h-5 w-3/4`} />
            <div className={`${bar} h-3 w-1/2`} />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function SkeletonList({ count = 4, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 rounded-md border border-hairline bg-raised shadow-card p-5">
          <div className="bb-skeleton hidden h-11 w-11 shrink-0 rounded sm:block" />
          <div className="flex-1 space-y-3">
            <div className={`${bar} h-3 w-28`} />
            <div className={`${bar} h-5 w-2/3`} />
            <div className={`${bar} h-3 w-11/12`} />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function SkeletonPost({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
      <div className={`${bar} mb-4 h-3 w-40`} />
      <div className="space-y-4 rounded-md border border-hairline bg-raised shadow-card p-5 sm:p-8">
        <div className={`${bar} h-3 w-32`} />
        <div className={`${bar} h-8 w-3/4`} />
        <div className="flex items-center gap-3">
          <div className="bb-skeleton h-9 w-9 rounded-full" />
          <div className={`${bar} h-3 w-36`} />
        </div>
        <div className={`${bar} h-3 w-full`} />
        <div className={`${bar} h-3 w-11/12`} />
        <div className={`${bar} h-3 w-4/5`} />
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
