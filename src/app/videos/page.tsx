import { collabEmail, socials } from "@/lib/socials";

export default function VideosPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Watch &amp; Follow</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Brandon&apos;s Brands on every platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Watch reviews, unboxings, new-release first looks and watch culture — pick your favorite place to follow along.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {socials.map((s) => (
            <article
              key={s.name}
              className="flex flex-col rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-[#D9A43A]">{s.name}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{s.handle}</h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{s.blurb}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex self-start rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
              >
                Follow on {s.name}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/30 p-6 text-slate-300">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Work with Brandon&apos;s Brands</p>
          <p className="mt-3 text-base leading-7">
            Brands, collectors and fellow creators — reach out about collabs, reviews and events at{" "}
            <span className="break-all text-[#D9A43A]">{collabEmail}</span>.
          </p>
          <a
            href={`mailto:${collabEmail}`}
            className="mt-6 inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
          >
            Email for collabs
          </a>
        </div>
      </div>
    </div>
  );
}
