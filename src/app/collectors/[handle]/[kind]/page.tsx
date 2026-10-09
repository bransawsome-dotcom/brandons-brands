import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import MakeOfferButton from "@/components/MakeOfferButton";
import MessageMemberButton from "@/components/MessageMemberButton";
import ShowOffCTA from "@/components/ShowOffCTA";
import { SITE_URL } from "@/lib/site";
import { loadPublicList, money, possessive, type ListKind, type PublicWatch, type PublicWish } from "@/lib/publicLists";

// A member's public collection or wishlist. Anyone can view it and search engines can index it.

export const revalidate = 60;

const getList = cache(async (handle: string, kind: string) => {
  if (kind !== "collection" && kind !== "wishlist") return null;
  return loadPublicList(handle, kind as ListKind);
});

function provenance(w: PublicWatch): string[] {
  const out: string[] = [];
  if (w.has_box && w.has_papers) out.push("Box & papers");
  else if (w.has_box) out.push("Box only");
  else if (w.has_papers) out.push("Papers only");
  if (w.authenticated || w.authenticated_by) out.push(w.authenticated_by ? `Authenticated by ${w.authenticated_by}` : "Third-party authenticated");
  return out;
}

function sum(values: (string | null | undefined)[]): number {
  return values.reduce((t, v) => {
    const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? t + n : t;
  }, 0);
}

function topBrands(items: { brand: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.brand, (counts.get(i.brand) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b).slice(0, 4);
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string; kind: string }> }): Promise<Metadata> {
  const { handle, kind } = await params;
  const list = await getList(handle, kind);
  if (!list) return { title: "Collection not found | Brandon's Brands", robots: { index: false } };
  const isCollection = list.kind === "collection";
  const brands = topBrands(list.items);
  const title = `${possessive(list.display_name)} watch ${isCollection ? "collection" : "wishlist"} | Brandon's Brands`;
  const description = `${list.items.length} watch${list.items.length === 1 ? "" : "es"}${
    brands.length ? ` including ${brands.join(", ")}` : ""
  } in ${possessive(list.display_name)} ${isCollection ? "collection" : "wishlist"} on Brandon's Brands.${
    isCollection ? " Make an offer on any watch." : " Have one to sell? Make an offer."
  }`;
  const path = `/collectors/${list.handle}/${list.kind}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // The branded preview image comes from opengraph-image.tsx next to this page.
    openGraph: { type: "website", url: path, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicListPage({ params }: { params: Promise<{ handle: string; kind: string }> }) {
  const { handle, kind } = await params;
  const list = await getList(handle, kind);
  if (!list) notFound();

  const isCollection = list.kind === "collection";
  const watches = list.items as PublicWatch[];
  const wishes = list.items as PublicWish[];
  const total = isCollection ? sum(watches.map((w) => w.estimated_value)) : sum(wishes.map((w) => w.market_value));
  const other: ListKind = isCollection ? "wishlist" : "collection";
  const otherPublic = isCollection ? list.wishlist_public : list.collection_public;
  const path = `/collectors/${list.handle}/${list.kind}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${possessive(list.display_name)} watch ${list.kind}`,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Collectors", item: `${SITE_URL}/collectors` },
        { "@type": "ListItem", position: 2, name: list.display_name, item: `${SITE_URL}${path}` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.items.length,
      itemListElement: list.items.slice(0, 100).map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: `${i.brand} ${i.model}`,
          brand: { "@type": "Brand", name: i.brand },
          ...(i.reference_number ? { mpn: i.reference_number } : {}),
          ...(i.image_url && /^https?:/.test(i.image_url) ? { image: i.image_url } : {}),
        },
      })),
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-12 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="mb-4 px-1 text-xs text-slate-400">
        <Link href="/collectors" className="hover:text-blue-200">Collectors</Link>
        <span aria-hidden className="mx-2">›</span>
        <span className="text-slate-300">{list.display_name}</span>
      </nav>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Public {list.kind}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {possessive(list.display_name)} {isCollection ? "watch collection" : "watch wishlist"}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-1.5 text-blue-100">
                {isCollection ? "Collection" : "Wishlist"}
              </span>
              {otherPublic ? (
                <Link
                  href={`/collectors/${list.handle}/${other}`}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  {other === "collection" ? "Collection" : "Wishlist"}
                </Link>
              ) : null}
              <MessageMemberButton handle={list.handle} name={list.display_name} compact />
              <a
                href={`${path}/story`}
                target="_blank"
                rel="noopener"
                title="Save a Story-size picture of this list to share on Instagram or TikTok"
                className="rounded-full border border-[#D9A43A]/50 px-4 py-1.5 font-semibold text-[#D9A43A] transition hover:bg-[#D9A43A]/10"
              >
                📲 Share to Story
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-center sm:min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Watches</dt>
              <dd className="mt-1 text-xl font-semibold text-white">{list.items.length}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{isCollection ? "Est. value" : "Market value"}</dt>
              <dd className="mt-1 text-xl font-semibold text-[#D9A43A]">{total ? money(total) : "—"}</dd>
            </div>
          </dl>
        </div>
        {list.items.length ? (
          isCollection ? (
            <p className="mt-5 text-sm text-slate-300">Interested in one of these watches? Use <span className="font-semibold text-[#D9A43A]">Make an offer</span> and the owner will get it right away, or send them a message.</p>
          ) : (
            <p className="mt-5 text-sm text-slate-300">Have one of these watches? Use <span className="font-semibold text-blue-200">Offer to sell</span> and {list.display_name} will get it right away, or send them a message.</p>
          )
        ) : null}
      </section>

      {!list.items.length ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-300">No watches here yet.</div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {list.items.map((item) => {
            const d = item.details ?? null;
            const specs = [d?.case_size_mm, d?.case_material, d?.movement].filter(Boolean).join(" · ");
            const w = item as PublicWatch;
            const wish = item as PublicWish;
            const label = `${item.brand} ${item.model}${item.reference_number ? ` · Ref. ${item.reference_number}` : ""}`;
            const stats = isCollection
              ? [
                  { label: "Est. value", value: money(w.estimated_value), gold: true },
                  { label: "Retail today", value: money(w.current_retail_price) },
                ]
              : [
                  { label: "Market value", value: money(wish.market_value), gold: true },
                  { label: "Retail today", value: money(wish.retail_price) },
                ];
            return (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.28)]">
                {item.image_url ? (
                  <div className="flex h-56 items-center justify-center bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={`${item.brand} ${item.model} watch`} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
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
                      {w.condition ? <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-200">{w.condition}</span> : null}
                      {provenance(w).map((p) => (
                        <span key={p} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 p-2">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{s.label}</dt>
                        <dd className={`mt-1 font-semibold ${s.gold ? "text-[#D9A43A]" : "text-white"}`}>{s.value ?? "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  {specs ? <p className="mt-3 text-sm text-slate-300">{specs}</p> : null}
                  {d?.summary ? <p className="mt-2 text-sm leading-6 text-slate-400">{d.summary}</p> : null}

                  <div className="mt-auto pt-5">
                    <MakeOfferButton handle={list.handle} watchId={item.id} watchLabel={label} kind={isCollection ? "buy" : "sell"} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ShowOffCTA className="mt-10" />
      <p className="mt-4 text-center text-xs text-slate-500">
        Values are estimates from public listings, not appraisals. Brandon&apos;s Brands doesn&apos;t take part in sales between members.
      </p>
    </div>
  );
}
