import type { Metadata } from "next";
import NewsletterSignup from "@/components/NewsletterSignup";
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
      images: [{ url: "/og-image.png?v=3", width: 1200, height: 630, alt: "Brandon's Brands" }],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: ["/og-image.png?v=3"] },
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
    publisher: { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about` },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.keywords?.join(", "),
    articleBody: post.body.map(plainText).join("\n\n").slice(0, 5000),
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <Link href="/blog" className="text-sm text-gold transition hover:text-gold">
          ← All posts
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-gold">
          {post.category} · {formatPostDate(post.date)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          By{" "}
          <Link href="/about" className="text-ink hover:text-ink">
            Brandon Volosov
          </Link>
        </p>
        <BlogBody paragraphs={post.body} />
      </article>
      <NewsletterSignup source="blog" compact className="mt-8" />
      <FollowBrandon className="mt-6" />
    </div>
  );
}
