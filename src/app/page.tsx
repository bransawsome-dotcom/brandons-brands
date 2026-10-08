import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07111F] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 sm:py-14 lg:px-16">
        <section className="relative flex py-24 sm:pt-44 sm:pb-48 lg:pt-64 lg:pb-72 flex-col items-center justify-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-10 lg:p-20">
          <div className="hero-bg absolute inset-0 -z-10 pointer-events-none" />
          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center gap-12 animate-fade-in">
            <p className="rounded-full border border-blue-400/25 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-blue-300 shadow-[0_0_45px_rgba(59,130,246,0.15)]">
              Luxury Watch Curation
            </p>
            {/* The logo is centered on the heading and sized so "Brandon's Brands" sits inside its inner dial. */}
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-1024.webp"
                alt=""
                aria-hidden
                width={1024}
                height={1024}
                className="logo-watermark pointer-events-none absolute left-1/2 top-1/2 -z-10 max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.28] drop-shadow-[0_0_90px_rgba(59,130,246,0.35)]"
              />
              <h1 className="relative z-10 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-[88px]">
                Brandon&apos;s
                <br />
                Brands
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover. Collect. Showcase the world's finest watches.
            </p>
          </div>
        </section>

        <section id="collection" className="mt-12 grid gap-6 sm:grid-cols-3">
          <Link href="/collection" className="group block rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">1</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">My Collection</h2>
            <p className="text-sm leading-6 text-slate-300">
              Store your watches with photo, brand, model, nickname and purchase date.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Open collection <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>

          <Link href="/wishlist" className="group block rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">2</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Wishlist</h2>
            <p className="text-sm leading-6 text-slate-300">
              Save watches you want to own.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Open wishlist <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>

          <Link href="/social" className="group block rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#D9A43A]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A43A]">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">3</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Social Media</h2>
            <p className="text-sm leading-6 text-slate-300">
              Follow along on Instagram, TikTok, YouTube and Facebook.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">Follow along <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
          </Link>
        </section>
      </main>
    </div>
  );
}
