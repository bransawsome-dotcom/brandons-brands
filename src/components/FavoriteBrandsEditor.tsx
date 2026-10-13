"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { LUXURY_BRANDS, MICRO_BRANDS, loadFavoriteBrands, saveFavoriteBrands } from "@/lib/favoriteBrands";

// "Your brands": the member's favorite brands, saved to their profile so they follow them on every device.
// mode "edit" (Account page) lets them change picks; mode "links" (Dashboard) shows them as quick searches.
export default function FavoriteBrandsEditor({ mode = "edit", className = "" }: { mode?: "edit" | "links"; className?: string }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<string[] | null>(null);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let live = true;
    void loadFavoriteBrands(user?.id).then((b) => live && setBrands(b));
    return () => {
      live = false;
    };
  }, [user?.id]);

  const update = async (next: string[]) => {
    setBrands(next);
    setSaved(false);
    const result = await saveFavoriteBrands(next);
    setBrands(result);
    setSaved(true);
  };
  const toggle = (b: string) => brands && void update(brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]);

  if (brands === null) return null;

  if (mode === "links") {
    if (!brands.length) return null;
    return (
      <section aria-labelledby="your-brands" className={`rounded-md border p-5 shadow-card bb-sheen sm:p-6 ${className}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="your-brands" className="text-xs uppercase tracking-[0.3em] text-gold">
            Your brands
          </h2>
          <Link href="/account#brands" className="text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
            Edit
          </Link>
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {brands.map((b) => (
            <li key={b}>
              <Link
                href={`/search?q=${encodeURIComponent(b)}`}
                className="inline-flex min-h-9 items-center rounded-full border border-hairline-strong bg-raised px-4 text-xs text-ink transition hover:border-navy"
              >
                {b}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const chip = (b: string) => (
    <button
      key={b}
      type="button"
      aria-pressed={brands.includes(b)}
      onClick={() => toggle(b)}
      className={`min-h-9 rounded-full border px-3.5 text-xs transition ${brands.includes(b) ? "border-navy bg-navy text-on-navy" : "border-hairline-strong bg-raised text-ink hover:border-navy"}`}
    >
      {b}
    </button>
  );
  const extras = brands.filter((b) => !LUXURY_BRANDS.includes(b) && !MICRO_BRANDS.includes(b));

  return (
    <section id="brands" aria-labelledby="brands-title" className={`scroll-mt-6 rounded-md border p-5 shadow-card bb-sheen sm:p-6 ${className}`}>
      <h2 id="brands-title" className="text-sm uppercase tracking-[0.3em] text-gold">
        Your brands
      </h2>
      <p className="mt-2 text-sm text-ink/80">Pick the names you love. They&apos;re saved to your account, so they follow you on every device.</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-muted">The houses</p>
      <div className="mt-2 flex flex-wrap gap-2">{LUXURY_BRANDS.map(chip)}</div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-muted">Microbrands</p>
      <div className="mt-2 flex flex-wrap gap-2">{MICRO_BRANDS.map(chip)}</div>
      {extras.length ? <div className="mt-4 flex flex-wrap gap-2">{extras.map(chip)}</div> : null}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = custom.trim().slice(0, 40);
          if (v && !brands.some((b) => b.toLowerCase() === v.toLowerCase())) void update([...brands, v]);
          setCustom("");
        }}
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Add another brand"
          aria-label="Add another brand"
          maxLength={40}
          className="min-h-10 min-w-0 flex-1 rounded border border-hairline bg-raised px-3 text-sm text-ink outline-none focus:border-navy"
        />
        <button type="submit" className="min-h-10 rounded-full bg-navy px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-navy hover:bg-navy-deep">
          Add
        </button>
      </form>
      <p className="mt-2 h-4 text-xs text-muted" role="status">
        {saved ? "Saved" : ""}
      </p>
    </section>
  );
}
