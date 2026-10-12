"use client";

import { useEffect, useState } from "react";
import { findWatchVersions, type WatchVersion } from "@/lib/watchAiClient";

// "Version" dropdown shown after a model is picked from the list (e.g. Bulgari Serpenti → Tubogas, Seduttori…).
// Choosing a version fills in its reference so the photo and prices match that exact watch. If a model has no
// versions, or the person skips, the plain model is used.
export default function VersionPicker({
  brand,
  model,
  onChoose,
  className = "",
}: {
  brand: string;
  model: string;
  onChoose: (version: WatchVersion | null) => void;
  className?: string;
}) {
  const [versions, setVersions] = useState<WatchVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState("");

  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => {
      if (!live) return;
      setVersions(null);
      setError(null);
      setChosen("");
    });
    findWatchVersions(brand, model)
      .then((list) => {
        if (!live) return;
        setVersions(list);
        if (!list.length) onChoose(null); // nothing to choose: use the plain model
      })
      .catch((err) => {
        if (!live) return;
        setError(err instanceof Error ? err.message : "Couldn't find versions.");
        onChoose(null);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the watch changes
  }, [brand, model]);

  if (error || (versions && !versions.length)) return null;

  return (
    <div className={`space-y-2 text-sm text-slate-300 ${className}`}>
      <label htmlFor="watch-version" className="block">
        Version <span className="text-slate-500">(pick the exact one for the right photo and prices)</span>
      </label>
      {versions === null ? (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3">
          <span className="bb-skeleton h-3 w-40 rounded-full" aria-hidden />
          <span className="text-xs text-slate-400">Finding versions of {model}…</span>
          <button type="button" onClick={() => onChoose(null)} className="text-xs font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
            Skip
          </button>
        </div>
      ) : (
        <select
          id="watch-version"
          value={chosen}
          onChange={(e) => {
            const v = e.target.value;
            setChosen(v);
            if (v === "__any") onChoose(null);
            else if (v !== "") onChoose(versions[Number(v)]);
          }}
          className="w-full rounded-3xl border border-[#D9A43A]/40 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-[#D9A43A]"
        >
          <option value="">Choose a version ({versions.length})</option>
          {versions.map((v, i) => (
            <option key={`${v.name}-${i}`} value={i}>
              {v.name}
              {v.reference_number ? ` · ${v.reference_number}` : ""}
              {v.detail ? ` — ${v.detail}` : ""}
            </option>
          ))}
          <option value="__any">Not sure / another version</option>
        </select>
      )}
    </div>
  );
}
