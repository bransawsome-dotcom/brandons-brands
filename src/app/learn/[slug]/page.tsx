import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FollowBrandon from "@/components/FollowBrandon";
import ShowOffCTA from "@/components/ShowOffCTA";
import { getGuide, learnGuides } from "@/lib/learn";
import { SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";

export function generateStaticParams() {
  return learnGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide not found | Brandon's Brands" };
  const path = `/learn/${g.slug}`;
  return {
    title: `${g.title} | Brandon's Brands`,
    description: g.description,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: g.title, description: g.description, images: ["/og-image.png"] },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const url = `${SITE_URL}/learn/${g.slug}`;
  const more = learnGuides.filter((x) => x.slug !== g.slug && x.category === g.category).concat(learnGuides.filter((x) => x.category !== g.category)).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.description,
      url,
      dateModified: g.updated,
      articleSection: g.category,
      author: { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about`, sameAs: socials.map((s) => s.url) },
      publisher: { "@type": "Organization", name: "Brandon's Brands", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-256.png` } },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Learn", item: `${SITE_URL}/learn` },
        { "@type": "ListItem", position: 2, name: g.title, item: url },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-4 px-1 text-xs text-slate-400">
        <Link href="/learn" className="hover:text-blue-200">
          Learn
        </Link>
        <span aria-hidden className="mx-2">
          ›
        </span>
        <Link href={`/learn#${g.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-blue-200">
          {g.category}
        </Link>
      </nav>

      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">{g.category}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl">{g.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">{g.description}</p>
        <p className="mt-3 text-xs text-slate-500">
          By Brandon Volosov · {g.minutes} min read · Updated{" "}
          {new Date(`${g.updated}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        {g.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-base leading-8 text-slate-300">
                {p}
              </p>
            ))}
            {s.bullets?.length ? (
              <ul className="mt-3 space-y-2 text-base leading-7 text-slate-300">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9A43A]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {g.related?.length ? (
          <div className="mt-10 rounded-2xl border border-[#3FB4EC]/25 bg-[#0E5A8F]/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Keep exploring</p>
            <ul className="mt-3 space-y-2">
              {g.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">More guides</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {more.map((m) => (
            <li key={m.slug}>
              <Link href={`/learn/${m.slug}`} className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/70 p-5 hover:border-[#D9A43A]/40">
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300">{m.category}</span>
                <span className="mt-1 font-semibold text-white">{m.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/learn" className="text-blue-300 hover:text-blue-200">
            ← All guides
          </Link>
        </p>
      </section>

      <ShowOffCTA className="mt-10" />
      <NewsletterSignup source="guide" compact className="mt-10" />
      <FollowBrandon className="mt-6" />
    </div>
  );
}
