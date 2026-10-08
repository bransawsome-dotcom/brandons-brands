import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

// Read-only page for a shared collection or wishlist. Anyone with the link can view it.

type Details = {
  case_size_mm?: string;
  case_material?: string;
  movement?: string;
  market_value_low?: number | null;
  market_value_high?: number | null;
} | null;

type SharedWatch = {
  id: string;
  brand: string;
  model: string;
  reference_number?: string | null;
  nickname?: string | null;
  image_url?: string | null;
  condition?: string | null;
  estimated_value?: string | null;
  retail_price?: string | null;
  current_retail_price?: string | null;
  details?: Details;
  has_box?: boolean | null;
  has_papers?: boolean | null;
  authenticated?: boolean | null;
  authenticated_by?: string | null;
  purchase_date?: string | null;
  purchase_price?: string | null;
  notes?: string | null;
};

type SharedWish = {
  id: string;
  brand: string;
  model: string;
  reference_number?: string | null;
  image_url?: string | null;
  priority?: string | null;
  market_value?: string | null;
  retail_price?: string | null;
  details?: Details;
  target_price?: string | null;
  notes?: string | null;
};

type Shared =
  | { kind: "collection"; owner_name: string; show_paid: boolean; show_notes: boolean; items: SharedWatch[] }
  | { kind: "wishlist"; owner_name: string; show_paid: boolean; show_notes: boolean; items: SharedWish[] };

const loadShared = cache(async (token: string): Promise<Shared | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !/^[a-f0-9]{16,64}$/i.test(token)) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_shared`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Shared | null;
  } catch {
    return null;
  }
});

function money(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null;
}

function sum(values: (string | null | undefined)[]): number {
  return values.reduce((t, v) => {
    const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? t + n : t;
  }, 0);
}

function provenance(w: SharedWatch): string[] {
  const out: string[] = [];
  if (w.has_box && w.has_papers) out.push("Box & papers");
  else if (w.has_box) out.push("Box only");
  else if (w.has_papers) out.push("Papers only");
  if (w.authenticated || w.authenticated_by) out.push(w.authenticated_by ? `Authenticated by ${w.authenticated_by}` : "Third-party authenticated");
  return out;
}

function possessive(name: string) {
  return name === "A collector" ? "A collector's" : `${name}'${name.endsWith("s") ? "" : "s"}`;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const shared = await loadShared(token);
  if (!shared) return { title: "Shared list | Brandon's Brands", robots: { index: false } };
  const title = `${possessive(shared.owner_name)} watch ${shared.kind} | Brandon's Brands`;
  const firstImage = shared.items.find((i) => i.image_url && /^https?:/.test(i.image_url))?.image_url ?? undefined;
  return {
    title,
    description: `${shared.items.length} watch${shared.items.length === 1 ? "" : "es"} shared on Brandon's Brands.`,
    robots: { index: false, follow: false },
    openGraph: { title, images: firstImage ? [firstImage] : undefined },
  };
}

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await loadShared(token);
  if (!shared) notFound();

  const isCollection = shared.kind === "collection";
  const total = isCollection
    ? sum((shared.items as SharedWatch[]).map((w) => w.estimated_value))
    : sum((shared.items as SharedWish[]).map((w) => w.market_value));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-16">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Shared {isCollection ? "collection" : "wishlist"}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {possessive(shared.owner_name)} {isCollection ? "watch collection" : "watch wishlist"}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Read-only view shared from Brandon&apos;s Brands.</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-center sm:min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Watches</dt>
              <dd className="mt-1 text-xl font-semibold text-white">{shared.items.length}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{isCollection ? "Est. value" : "Market value"}</dt>
              <dd className="mt-1 text-xl font-semibold text-[#D9A43A]">{total ? money(total) : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {!shared.items.length ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-300">Nothing here yet.</div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shared.items.map((item) => {
            const d = item.details ?? null;
            const specs = [d?.case_size_mm, d?.case_material, d?.movement].filter(Boolean).join(" · ");
            const range =
              typeof d?.market_value_low === "number" && typeof d?.market_value_high === "number"
                ? `${money(d.market_value_low)} – ${money(d.market_value_high)}`
                : null;
            const w = item as SharedWatch;
            const wish = item as SharedWish;
            const stats = isCollection
              ? [
                  { label: "Est. value", value: money(w.estimated_value), gold: true },
                  { label: "Retail today", value: money(w.current_retail_price) },
                  ...(shared.show_paid ? [{ label: "Paid", value: money(w.purchase_price) }] : []),
                ]
              : [
                  { label: "Market value", value: money(wish.market_value), gold: true },
                  { label: "Retail today", value: money(wish.retail_price) },
                  ...(shared.show_paid ? [{ label: "Target", value: money(wish.target_price) }] : []),
                ];
            return (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.28)]">
                {item.image_url ? (
                  <div className="flex h-56 items-center justify-center bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={`${item.brand} ${item.model}`} referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center bg-slate-950/80 text-sm text-slate-500">No photo</div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.25em] text-blue-300">{item.brand}</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">{item.model}</h2>
                      {item.reference_number ? <p className="text-sm text-slate-400">Ref. {item.reference_number}</p> : null}
                      {isCollection && w.nickname ? <p className="text-sm italic text-slate-400">“{w.nickname}”</p> : null}
                    </div>
                    {!isCollection && wish.priority ? (
                      <span className="shrink-0 rounded-full border border-[#D9A43A]/30 bg-[#D9A43A]/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[#D9A43A]">
                        {wish.priority}
                      </span>
                    ) : null}
                  </div>

                  {isCollection && (provenance(w).length || w.condition) ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.condition ? (
                        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-200">{w.condition}</span>
                      ) : null}
                      {provenance(w).map((p) => (
                        <span key={p} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <dl className={`mt-4 grid gap-2 text-center ${stats.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 p-2">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{s.label}</dt>
                        <dd className={`mt-1 font-semibold ${s.gold ? "text-[#D9A43A]" : "text-white"}`}>{s.value ?? "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  {range ? <p className="mt-2 text-xs text-slate-400">Market range {range}</p> : null}
                  {specs ? <p className="mt-3 text-sm text-slate-300">{specs}</p> : null}
                  {isCollection && shared.show_paid && w.purchase_date ? <p className="mt-1 text-xs text-slate-400">Bought {w.purchase_date}</p> : null}
                  {shared.show_notes && item.notes ? <p className="mt-3 text-sm leading-6 text-slate-200">📝 {item.notes}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 rounded-[2rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-6 text-center">
        <p className="text-lg font-semibold text-white">Track your own watches</p>
        <p className="mt-1 text-sm text-slate-300">
          Build your collection and wishlist with photos, values and box &amp; papers, then share it with one link.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black hover:bg-[#e1b54a]"
        >
          Create a free account
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Values are estimates from public listings, not appraisals.</p>
    </div>
  );
}
