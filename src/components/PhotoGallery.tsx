"use client";

import { useEffect, useState } from "react";

// Photos on a forum post or reply. Tap one to see it full size.
export default function PhotoGallery({ photos, alt, small = false, className = "" }: { photos?: string[] | null; alt: string; small?: boolean; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % (photos?.length ?? 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + (photos?.length ?? 1)) % (photos?.length ?? 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos?.length]);

  if (!photos?.length) return null;
  const one = photos.length === 1;

  return (
    <>
      <div className={`grid gap-2 ${one ? "grid-cols-1" : "grid-cols-2"} ${small ? "max-w-sm" : "max-w-2xl"} ${className}`}>
        {photos.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className={`overflow-hidden rounded-2xl border border-white/10 bg-black/30 ${one ? "" : "aspect-square"}`}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${alt} (photo ${i + 1})`} loading="lazy" className={`h-full w-full ${one ? `object-contain ${small ? "max-h-64" : "max-h-[28rem]"}` : "object-cover"}`} />
          </button>
        ))}
      </div>
      {open !== null ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open]} alt={`${alt} (photo ${open + 1})`} className="max-h-full max-w-full rounded-xl object-contain" />
          <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
            ✕ Close
          </button>
          {photos.length > 1 ? (
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-slate-300">
              {open + 1} / {photos.length} · tap outside to close
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
