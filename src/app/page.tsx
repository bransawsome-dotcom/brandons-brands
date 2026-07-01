import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-16 sm:px-10 lg:px-16">
        <section className="relative flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-14 lg:p-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)]" />
          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center gap-8">
            <p className="rounded-full border border-blue-400/25 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-blue-300 shadow-[0_0_45px_rgba(59,130,246,0.15)]">
              Luxury Watch Curation
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Brandon&apos;s Brands
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Track. Organize. Enjoy Your Collection.
            </p>
            <div className="flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/collection"
                className="inline-flex items-center justify-center rounded-full bg-[#D9A43A] px-8 py-4 text-base font-semibold uppercase tracking-wide text-black shadow-[0_20px_60px_rgba(217,164,58,0.25)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a]"
              >
                Start My Collection
              </Link>
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-full border border-blue-500/30 bg-white/5 px-8 py-4 text-base font-semibold text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/10"
              >
                Watch Instagram
              </Link>
            </div>
          </div>
        </section>

        <section id="collection" className="mt-12 grid gap-6 sm:grid-cols-3">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">1</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">My Collection</h2>
            <p className="text-sm leading-6 text-slate-300">
              Store your watches with photo, brand, model, nickname and purchase date.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">2</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Wishlist</h2>
            <p className="text-sm leading-6 text-slate-300">
              Save watches you want to own.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15">
              <span className="text-lg font-semibold">3</span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Instagram</h2>
            <p className="text-sm leading-6 text-slate-300">
              Display videos from @brandonsbrands17.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
