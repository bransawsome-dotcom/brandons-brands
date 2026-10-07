import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, formatPostDate, getPostBySlug } from "@/lib/blogPosts";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Blog | Brandon's Brands" };
  return {
    title: `${post.title} | Brandon's Brands`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        <Link
          href="/blog"
          className="text-sm text-blue-300 transition hover:text-blue-200"
        >
          ← All posts
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#D9A43A]">
          {post.category} · {formatPostDate(post.date)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-slate-300">
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
