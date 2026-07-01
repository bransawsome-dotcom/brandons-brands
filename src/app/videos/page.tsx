import Script from "next/script";

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
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-5 rounded-3xl bg-black/50 p-4 text-sm text-slate-400">
              Latest reel preview.
            </div>
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/CxQ8cC8s06Y/"
              data-instgrm-version="14"
              style={{ background: "#000", border: "none", margin: "0 auto", maxWidth: "540px", minWidth: "326px", padding: "0", width: "100%" }}
            >
              <a href="https://www.instagram.com/reel/CxQ8cC8s06Y/">Instagram reel</a>
            </blockquote>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-5 rounded-3xl bg-black/50 p-4 text-sm text-slate-400">
              Explore the latest stories and watch drops.
            </div>
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/Cv2RTCGgX5v/"
              data-instgrm-version="14"
              style={{ background: "#000", border: "none", margin: "0 auto", maxWidth: "540px", minWidth: "326px", padding: "0", width: "100%" }}
            >
              <a href="https://www.instagram.com/reel/Cv2RTCGgX5v/">Instagram reel</a>
            </blockquote>
          </div>
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/30 p-6 text-slate-300">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Keep your content polished</p>
          <p className="mt-3 text-base leading-7">
            These embeds surface your latest reel activity for collectors and luxury watch fans. Replace the reel links with your current posts to keep the feed fresh.
          </p>
          <a
            href="https://www.instagram.com/brandonsbrands17"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
          >
            Visit @brandonsbrands17
          </a>
        </div>

        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      </div>
    </div>
  );
}
