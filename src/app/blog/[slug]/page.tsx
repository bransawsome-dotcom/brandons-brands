import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate } from "@/lib/blogPosts";
import { loadAllPosts, loadPost } from "@/lib/blogDb";
import BlogBody, { plainText } from "@/components/BlogBody";
import FollowBrandon from "@/components/FollowBrandon";
import { SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";

// Posts published from the Drafts page appear within 5 minutes.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await loadAllPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Blog | Brandon's Brands" };
  const description = post.metaDescription || post.excerpt;
  return {
    title: `${post.title} | Brandon's Brands`,
    description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      siteName: "Brandon's Brands",
      title: post.title,
      description,
      publishedTime: post.date,
      authors: ["Brandon Volosov"],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Brandon's Brands" }],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: ["/og-image.png"] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about`, sameAs: socials.map((s) => s.url) },
    publisher: { "@type": "Organization", name: "Brandon's Brands", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-256.webp` } },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.keywords?.join(", "),
    articleBody: post.body.map(plainText).join("\n\n").slice(0, 5000),
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        <Link href="/blog" className="text-sm text-blue-300 transition hover:text-blue-200">
          ← All posts
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#D9A43A]">
          {post.category} · {formatPostDate(post.date)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          By{" "}
          <Link href="/about" className="text-slate-200 hover:text-white">
            Brandon Volosov
          </Link>
        </p>
        <BlogBody paragraphs={post.body} />
      </article>
      <FollowBrandon className="mt-8" />
    </div>
  );
}
