import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate } from "@/lib/blogPosts";
import { loadAllPosts } from "@/lib/blogDb";
import DraftsLink from "@/components/DraftsLink";
import LatestVideos from "@/components/LatestVideos";

// New posts published from the Drafts page show up within 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Watch Reviews & Interviews | Brandon's Brands",
  description: "Watch reviews, interviews, new releases and microbrand spotlights from Brandon Volosov of Brandon's Brands.",
  alternates: { canonical: "/blog" },
};

const isInterview = (c: string) => /interview/i.test(c);

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const all = await loadAllPosts();
  // Category chips: Interviews first when there are any, then the rest by how many posts they have.
  const counts = new Map<string, number>();
  for (const p of all) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const cats = [...counts.keys()].sort((a, b) => Number(isInterview(b)) - Number(isInterview(a)) || (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
  const active = c && counts.has(c) ? c : "";
  const blogPosts = active ? all.filter((p) => p.category === active) : all;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
      <div>
        <div className="mb-10">
          <span aria-hidden className="block h-px w-10 bg-gold" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Reviews</p>
          <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
            Reviews &amp; <span className="font-light text-gold">interviews</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/80">
            Brandon&apos;s hands-on watch reviews, conversations with the people behind the brands, and the stories behind new releases.
          </p>
          <DraftsLink />
        </div>

        {!active ? <LatestVideos count={6} className="mb-14" /> : null}

        {cats.length > 1 ? (
          <nav aria-label="Filter by type" className="mb-8 flex flex-wrap gap-2.5">
            {["", ...cats].map((cat) => (
              <Link
                key={cat || "all"}
                href={cat ? `/blog?c=${encodeURIComponent(cat)}` : "/blog"}
                scroll={false}
                aria-current={active === cat ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full border px-5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  active === cat ? "border-gold bg-gold text-on-gold" : "border-hairline-strong text-ink/80 hover:border-navy hover:text-ink"
                }`}
              >
                {cat || "All"}
              </Link>
            ))}
          </nav>
        ) : null}

        {blogPosts.length === 0 ? (
          <div className="rounded-md border border-hairline bg-raised shadow-card p-6 text-ink/80 bb-sheen">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Coming soon</p>
            <p className="mt-3 text-base leading-7">The first post is on its way. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col rounded-md border border-hairline bg-raised p-6 shadow-card transition hover:-translate-y-1 bb-sheen"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-gold">
                  {post.category} · {formatPostDate(post.date)}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{post.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-ink/80">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
                >
                  {isInterview(post.category) ? "Read the interview" : "Read more"}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
