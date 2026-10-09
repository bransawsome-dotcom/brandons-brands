import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import ShowOffCTA from "@/components/ShowOffCTA";
import LatestVideos from "@/components/LatestVideos";
import PollCard from "@/components/PollCard";
import { loadPolls } from "@/lib/polls";

// Videos and the poll refresh every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  const poll = (await loadPolls(5)).find((p) => p.active);
  return (
    <div className="min-h-screen bg-[#07111F] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 sm:py-14 lg:px-16">
        <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 px-6 pb-12 pt-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:px-10 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
          <div className="hero-bg absolute inset-0 -z-10 pointer-events-none" />
          <div className="relative z-10 flex w-full flex-col items-center text-center animate-fade-in">
            {/* The logo gets its own square space; "Brandon's Brands" sits centered inside its inner dial. */}
            <div className="logo-stage relative flex max-w-none shrink-0 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-1024.webp"
                alt=""
                aria-hidden
                width={1024}
                height={1024}
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none opacity-[0.28] drop-shadow-[0_0_90px_rgba(59,130,246,0.35)]"
              />
              <div className="relative">
                <p className="absolute bottom-full left-1/2 mb-5 -translate-x-1/2 whitespace-nowrap rounded-full border border-blue-400/25 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-blue-300 shadow-[0_0_45px_rgba(59,130,246,0.15)] sm:mb-8 sm:px-4 sm:py-2 sm:text-sm sm:tracking-[0.3em]">
                  Luxury Watch Curation
                </p>
                <h1 className="relative z-10 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-[88px]">
                  Brandon&apos;s
                  <br />
                  Brands
                </h1>
              </div>
            </div>
            <p className="-mt-2 max-w-2xl text-base leading-7 text-slate-300 sm:-mt-4 sm:text-lg lg:-mt-6">
              <span className="block">Discover. Collect.</span>
              <span className="block">Showcase the world&apos;s finest watches.</span>
            </p>
          </div>
        </section>

        <LatestVideos className="mt-12" />

        {poll ? <PollCard poll={poll} className="mt-12" /> : null}

        {/* Community: reasons to come back every week. */}
        <section aria-label="Community" className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/wrist-check", icon: "📸", title: "Wrist Check", text: "Post what's on your wrist today. Brandon picks a Wrist Check of the Week." },
            { href: "/events", icon: "📅", title: "Watch events", text: "Upcoming microbrand watch fairs, shows and collector meetups." },
            { href: "/forum", icon: "💬", title: "Forum", text: "Ask questions, share finds and find watches for sale or wanted." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group rounded-[1.75rem] border border-[#3FB4EC]/20 bg-[#0E5A8F]/10 p-5 transition hover:-translate-y-1 hover:border-[#3FB4EC]/50">
              <p className="text-2xl" aria-hidden>
                {c.icon}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">{c.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">{c.text}</p>
            </Link>
          ))}
        </section>

        <section id="collection" className="mt-12 grid gap-6 sm:grid-cols-3">
          <Link href="/collection" className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <h2 className="mb-3 text-2xl font-semibold text-white">My Collection</h2>
            <p className="flex-1 text-sm leading-6 text-slate-300">
              Store your watches with photo, brand, model and purchase date, and track what each one is worth with daily estimated values.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Open collection <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>

          <Link href="/wishlist" className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <h2 className="mb-3 text-2xl font-semibold text-white">Wishlist</h2>
            <p className="flex-1 text-sm leading-6 text-slate-300">
              Save watches you want to own.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Open wishlist <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>

          <Link href="/social" className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <h2 className="mb-3 text-2xl font-semibold text-white">Social Media</h2>
            <p className="flex-1 text-sm leading-6 text-slate-300">
              Follow along on Instagram, TikTok, YouTube and Facebook.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Follow along <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>
        </section>

        <ShowOffCTA className="mt-12" />

        <NewsletterSignup source="home" className="mt-12" />
      </main>
    </div>
  );
}
