"use client";

import Link from "next/link";
import { useState } from "react";

export type EditWatch = { id: string; brand: string; model: string; image: string | null; href: string };

// "The Edit": Brandon's Favorites as a numbered list. Hovering or focusing a name shows that watch's
// photo in the frame beside it (on phones the photo sits above the list).
export default function TheEdit({ watches }: { watches: EditWatch[] }) {
  const withPhoto = watches.find((w) => w.image);
  const [shown, setShown] = useState<EditWatch | undefined>(withPhoto);
  if (!watches.length) return null;
  const pick = (w: EditWatch) => {
    if (w.image) setShown(w);
  };

  return (
    <div className="grid items-start gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
      <figure className="bb-shine relative m-0 aspect-[4/5] overflow-hidden border border-hairline bg-surface">
        {shown?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={shown.id} src={shown.image} alt={`${shown.brand} ${shown.model}`} className="absolute inset-0 h-full w-full object-cover animate-fade-in" />
        ) : null}
        {shown ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-12 text-[11px] uppercase tracking-[0.2em] text-white">
            {shown.brand} · {shown.model}
          </figcaption>
        ) : null}
      </figure>
      <ol className="m-0 list-none p-0">
        {watches.map((w, i) => (
          <li key={w.id} className="border-b border-hairline">
            <Link
              href={w.href}
              onMouseEnter={() => pick(w)}
              onFocus={() => pick(w)}
              className="group flex items-baseline gap-5 py-3.5 text-ink sm:gap-7"
            >
              <span className="w-7 shrink-0 text-[11px] tracking-[0.12em] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`min-w-0 flex-1 truncate font-serif text-[26px] leading-tight transition sm:text-[34px] ${
                  shown?.id === w.id ? "italic text-gold-bright" : "group-hover:text-gold-bright"
                }`}
              >
                {w.model}
              </span>
              <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted">{w.brand}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
