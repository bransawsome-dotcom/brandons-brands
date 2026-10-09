import Link from "next/link";
import type { Metadata } from "next";
import MessageMemberButton from "@/components/MessageMemberButton";
import FollowBrandon from "@/components/FollowBrandon";
import { isFavoritesPost, siteSearch, type WatchHit } from "@/lib/search";
import { linkInfo } from "@/lib/favorites";

// Site search: keywords, watches in public collections and wishlists, members' public names and forum names.

export const metadata: Metadata = {
  title: "Search | Brandon's Brands",
  description: "Search Brandon's Brands: watches in public collections and wishlists, collectors, forum discussions, Brandon's favorites and the blog.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const SUGGESTIONS = ["Rolex", "Omega Speedmaster", "Tudor", "Microbrand", "Chronograph", "Diver"];

function WatchCard({ w, kind }: { w: WatchHit; kind: "collection" | "wishlist" }) {
  return (
    <li>
      <Link
        href={`/collectors/${w.handle}/${kind}`}
        className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 transition hover:border-[#3FB4EC]/50"
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
          {w.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.image_url} alt={`${w.brand} ${w.model}`} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <span aria-hidden className="text-2xl">
              ⌚
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-300">{w.brand}</span>
          <span className="block truncate font-semibold text-white">{w.model}</span>
          {w.reference_number ? <span className="block truncate text-xs text-slate-400">Ref. {w.reference_number}</span> : null}
          <span className="mt-0.5 block truncate text-xs text-[#D9A43A]">
            {kind === "collection" ? "In" : "On"} {w.display_name}&apos;s {kind} · {kind === "collection" ? "Make an offer" : "Offer to sell"} →
          </span>
        </span>
      </Link>
    </li>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
        {title}
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">{count}</span>
      </h2>
      {children}
    </section>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").trim();
  const r = q ? await siteSearch(q) : null;
  const total = r
    ? r.watches.length + r.wishes.length + r.people.length + r.posts.length + r.authors.length + r.favorites.length + r.blog.length + r.pages.length
    : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-0 py-4 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Search</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Search Brandon&apos;s Brands</h1>
        <form action="/search" method="get" role="search" className="mt-5 flex gap-2">
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            defaultValue={q}
            autoFocus={!q}
            placeholder="Watches, brands, collectors, forum names…"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950/90 px-5 py-3 text-white outline-none transition focus:border-blue-400/70"
          />
          <button type="submit" className="shrink-0 rounded-full bg-[#D9A43A] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#e1b54a]">
            Search
          </button>
        </form>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Searches watches in public collections and wishlists, members&apos; public names, forum discussions and forum names, Brandon&apos;s
          favorites, the blog and site pages.
        </p>
        {!q ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">
                {s}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {r ? (
        <>
          <p className="mt-6 px-1 text-sm text-slate-400">
            {total ? `${total} result${total === 1 ? "" : "s"} for ` : "No results for "}
            <span className="font-semibold text-white">“{r.query}”</span>
            {total ? "" : ". Try a brand, model or name, or check the spelling."}
          </p>

          <Section title="Watches in public collections" count={r.watches.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.watches.map((w) => (
                <WatchCard key={w.id} w={w} kind="collection" />
              ))}
            </ul>
          </Section>

          <Section title="Watches on public wishlists" count={r.wishes.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.wishes.map((w) => (
                <WatchCard key={w.id} w={w} kind="wishlist" />
              ))}
            </ul>
          </Section>

          <Section title="Brandon's favorites" count={r.favorites.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.favorites.map((f) => {
                const info = linkInfo(f.link_url);
                return (
                  <li key={f.id}>
                    <Link
                      href={f.post_id ? `/forum/${f.post_id}` : "/favorites"}
                      className="flex h-full items-center gap-3 rounded-2xl border border-[#3FB4EC]/25 bg-[#0E5A8F]/10 p-3 transition hover:border-[#3FB4EC]/60"
                    >
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                        {f.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.image_url} alt={`${f.brand} ${f.model}`} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <span aria-hidden className="text-2xl">
                            ⭐
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-300">⭐ {f.brand}</span>
                        <span className="block truncate font-semibold text-white">{f.model}</span>
                        {info ? <span className="block text-xs text-[#5CC4F2]">{info.label} · discussion →</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Collectors" count={r.people.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.people.map((p) => (
                <li key={p.handle} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{p.display_name}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs">
                      {p.collection_public ? (
                        <Link href={`/collectors/${p.handle}/collection`} className="text-[#D9A43A] hover:text-[#e1b54a]">
                          Collection
                        </Link>
                      ) : null}
                      {p.wishlist_public ? (
                        <Link href={`/collectors/${p.handle}/wishlist`} className="text-blue-200 hover:text-white">
                          Wishlist
                        </Link>
                      ) : null}
                      {!p.collection_public && !p.wishlist_public ? <span className="text-slate-500">Member</span> : null}
                    </p>
                  </div>
                  <MessageMemberButton handle={p.handle} name={p.display_name} compact />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Forum names" count={r.authors.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.authors.map((a) => (
                <li key={`${a.user_id}-${a.author_name}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{a.author_name}</p>
                    <p className="text-xs text-slate-400">
                      {a.posts} forum post{a.posts === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Link
                    href={`/inbox?to=${encodeURIComponent(a.user_id)}&name=${encodeURIComponent(a.author_name)}`}
                    rel="nofollow"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-4 py-2 text-sm font-semibold text-white hover:from-[#2290D6] hover:to-[#136AA6]"
                  >
                    <span aria-hidden>✉️</span> Message
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Forum discussions" count={r.posts.length}>
            <ul className="space-y-2">
              {r.posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/forum/${p.id}`} className="block rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 transition hover:border-[#3FB4EC]/50">
                    <span className="block font-semibold text-white">
                      {isFavoritesPost(p.subject) ? "⭐ " : "💬 "}
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-400">by {p.author_name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Guides & blog" count={r.blog.length}>
            <ul className="space-y-2">
              {r.blog.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="block rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-[#3FB4EC]/50">
                    <span className="block font-semibold text-white">{b.title}</span>
                    <span className="text-sm text-slate-400">{b.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Pages" count={r.pages.length}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {r.pages.map((pg) => (
                <li key={pg.href}>
                  <Link href={pg.href} className="block rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-[#3FB4EC]/50">
                    <span className="block font-semibold text-white">{pg.title}</span>
                    <span className="text-sm text-slate-400">{pg.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </>
      ) : null}

      <FollowBrandon className="mt-12" />
    </div>
  );
}
