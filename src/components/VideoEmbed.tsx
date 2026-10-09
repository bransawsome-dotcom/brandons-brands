import type { Embed } from "@/lib/video";

// Plays one of Brandon's videos right on the page (YouTube Short, Instagram reel or TikTok).
export default function VideoEmbed({ embed, title, className = "" }: { embed: Embed; title: string; className?: string }) {
  return (
    <div
      className={`relative mx-auto w-full overflow-hidden rounded-2xl bg-black ${embed.vertical ? "max-w-[340px]" : ""} ${className}`}
      style={{ aspectRatio: embed.vertical ? (embed.platform === "Instagram" ? "9 / 15" : "9 / 16") : "16 / 9" }}
    >
      <iframe
        src={embed.src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
