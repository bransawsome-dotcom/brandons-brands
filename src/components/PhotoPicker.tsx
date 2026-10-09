"use client";

import { useRef, useState } from "react";
import { shrinkPhoto } from "@/lib/photos";

// "📷 Add photos" button with removable thumbnails, for forum posts and replies.
export default function PhotoPicker({
  photos,
  onChange,
  max = 4,
  compact = false,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    const next = [...photos];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= max) {
          setError(`You can add up to ${max} photos.`);
          break;
        }
        next.push(await shrinkPhoto(file));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that photo.");
    } finally {
      onChange(next);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const size = compact ? "h-16 w-16" : "h-24 w-24";

  return (
    <div className="space-y-2">
      {photos.length ? (
        <div className="flex flex-wrap gap-2">
          {photos.map((src, i) => (
            <div key={i} className={`relative ${size} overflow-hidden rounded-xl border border-white/10`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs text-white hover:bg-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {photos.length < max ? (
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 ${busy ? "opacity-60" : ""}`}>
          <span aria-hidden>📷</span>
          {busy ? "Adding…" : photos.length ? "Add another photo" : "Add photos"}
          <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => void add(e.target.files)} />
        </label>
      ) : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
