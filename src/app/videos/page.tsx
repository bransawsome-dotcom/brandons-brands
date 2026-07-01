export default function VideosPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Instagram Reels</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Latest reels from @brandonsbrands17
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Watch premium watch culture, unboxings, and collection highlights from Brandon&apos;s Brands.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-white">Premium Watch Reels</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Discover the finest reels showcasing luxury watch reveals, styling edits, and classic movement details from Brandon&apos;s Brands.
            </p>
            <a
              href="https://www.instagram.com/brandonsbrands17/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
            >
              Watch on Instagram
            </a>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-white">Story Highlights</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Follow curated story content about new drops, collector insights, and the latest watch culture from the brand&apos;s Instagram feed.
            </p>
            <a
              href="https://www.instagram.com/brandonsbrands17/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
            >
              Watch on Instagram
            </a>
          </article>
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/30 p-6 text-slate-300">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Stay connected</p>
          <p className="mt-3 text-base leading-7">
            Follow @brandonsbrands17 on Instagram for the latest reels, stories, and watch content.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            These premium cards link directly to the Instagram profile for the most up-to-date lifestyle and watch posts.
          </p>
          <a
            href="https://www.instagram.com/brandonsbrands17/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
          >
            Visit @brandonsbrands17
          </a>
        </div>

      </div>
    </div>
  );
}
