import { latestYouTubeVideos } from "@/lib/youtube";
import { socials } from "@/lib/socials";
import LatestVideosGrid from "@/components/LatestVideosGrid";

// "Latest from Brandon": his newest YouTube Shorts, refreshed hourly. Tap to play on the page.
// Hidden if YouTube can't be reached.
export default async function LatestVideos({ count = 6, className = "" }: { count?: number; className?: string }) {
  const videos = (await latestYouTubeVideos(3600).catch(() => [])).slice(0, count);
  if (!videos.length) return null;
  return (
    <section aria-labelledby="latest-videos" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-4 h-0.5 w-11 bg-gold" aria-hidden />
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold">New this week</p>
          <h2 id="latest-videos" className="font-display text-[38px] font-semibold uppercase leading-[1.05] text-ink sm:text-[54px]">
            Latest from <span className="font-light text-gold">Brandon</span>
          </h2>
          <p className="mt-3 text-muted">Hands-on watch reviews of new releases, microbrands and independents.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-hairline-strong px-4 text-[11px] uppercase tracking-[0.2em] text-ink transition hover:border-gold hover:text-gold-bright"
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>
      <LatestVideosGrid videos={videos.map(({ id, title, thumbnail }) => ({ id, title, thumbnail }))} />
    </section>
  );
}
