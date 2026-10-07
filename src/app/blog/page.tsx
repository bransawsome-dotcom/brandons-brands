import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, formatPostDate } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Blog | Brandon's Brands",
  description: "Watch stories, collecting tips, and news from Brandon's Brands.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">The Journal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Brandon&apos;s Brands Blog
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Watch stories, collecting tips, and behind-the-scenes looks at the collection.
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 text-slate-300">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Coming soon</p>
            <p className="mt-3 text-base leading-7">The first post is on its way. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[#D9A43A]">
                  {post.category} · {formatPostDate(post.date)}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">{post.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex self-start rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
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
