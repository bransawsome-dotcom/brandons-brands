import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate } from "@/lib/blogPosts";
import { loadAllPosts } from "@/lib/blogDb";
import DraftsLink from "@/components/DraftsLink";

// New posts published from the Drafts page show up within 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Brandon's Brands",
  description: "Watch stories, collecting tips, new releases and microbrand spotlights from Brandon Volosov of Brandon's Brands.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const blogPosts = await loadAllPosts();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
      <div>
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">The Journal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
            Brandon&apos;s Brands Blog
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/80">
            Watch stories, collecting tips, and behind-the-scenes looks at the collection.
          </p>
          <DraftsLink />
        </div>

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
                <h2 className="mt-3 text-xl font-semibold text-ink">{post.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-ink/80">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
                >
                  Read post
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
