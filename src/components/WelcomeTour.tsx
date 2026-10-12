"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// A four-step welcome for new members, shown once (per device) the first time they reach their dashboard.
// The last step lets them pick favorite brands; picks are kept on this device for now.
const SEEN_KEY = "bb-welcome-seen";
export const BRANDS_KEY = "bb-favorite-brands";

const steps = [
  { kicker: "Discover", title: "Reviews & hidden gems", text: "Brandon's hands-on reviews, first looks and the microbrands worth knowing, new every week." },
  { kicker: "Share", title: "Wrist Check & the forum", text: "Show what's on your wrist, talk shop with fellow collectors and meet people who get it." },
  { kicker: "Collect", title: "Your collection, valued", text: "Log every watch you own and want, with box and papers, photos and estimated values." },
];
const LUXURY = ["Rolex", "Omega", "Tudor", "Cartier", "Grand Seiko", "Patek Philippe", "Audemars Piguet", "IWC", "Seiko", "Longines", "Oris", "TAG Heuer"];
const MICRO = ["Baltic", "Christopher Ward", "Farer", "Studio Underd0g", "Lorier", "Furlan Marri", "Kurono Tokyo", "Nodus"];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: fine */
  }
}

export default function WelcomeTour() {
  const { user } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (!user || read(SEEN_KEY)) return;
    const t = setTimeout(() => dialog.current?.showModal(), 600);
    return () => clearTimeout(t);
  }, [user]);

  const finish = () => {
    write(SEEN_KEY, "1");
    if (picked.length) write(BRANDS_KEY, JSON.stringify(picked));
    dialog.current?.close();
  };
  const toggle = (b: string) => setPicked((p) => (p.includes(b) ? p.filter((x) => x !== b) : [...p, b]));
  const last = step === steps.length;

  const chip = (b: string) => (
    <button
      key={b}
      type="button"
      aria-pressed={picked.includes(b)}
      onClick={() => toggle(b)}
      className={`min-h-9 rounded-full border px-3.5 text-xs transition ${picked.includes(b) ? "border-gold bg-gold text-on-gold" : "border-hairline-strong text-ink hover:border-gold"}`}
    >
      {b}
    </button>
  );

  return (
    <dialog
      ref={dialog}
      onCancel={finish}
      aria-labelledby="welcome-title"
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-md border border-hairline bg-ground p-0 text-ink shadow-[0_30px_80px_rgba(43,38,32,0.35)] backdrop:bg-[#2b2620]/55 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Welcome to Brandon&apos;s Brands</p>
        <button type="button" onClick={finish} className="text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink">
          Skip
        </button>
      </div>

      <div className="min-h-[300px] px-6 py-8 sm:px-8">
        {!last ? (
          <div key={step} className="bb-tour-step">
            <span className="font-display text-sm font-semibold text-gold">0{step + 1}</span>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted">{steps[step].kicker}</p>
            <h2 id="welcome-title" className="mt-2 font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">
              {steps[step].title}
            </h2>
            <p className="mt-4 font-serif text-xl italic leading-8 text-ink/80">{steps[step].text}</p>
          </div>
        ) : (
          <div className="bb-tour-step">
            <span className="font-display text-sm font-semibold text-gold">04</span>
            <h2 id="welcome-title" className="mt-2 font-display text-4xl font-semibold uppercase leading-none">
              Pick your <span className="font-light text-gold">brands</span>
            </h2>
            <p className="mt-3 text-sm text-ink/80">Choose the names you love. You can change these any time.</p>
            <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-muted">The houses</p>
            <div className="mt-2 flex flex-wrap gap-2">{LUXURY.map(chip)}</div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-muted">Microbrands</p>
            <div className="mt-2 flex flex-wrap gap-2">{MICRO.map(chip)}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-hairline px-6 py-4">
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-gold" : "w-1.5 bg-hairline-strong"}`} />
          ))}
        </div>
        {last ? (
          <Link
            href="/collection"
            onClick={finish}
            className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-xs font-semibold uppercase tracking-[0.2em] text-on-gold hover:bg-gold-bright"
          >
            Start my collection
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            autoFocus
            className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-xs font-semibold uppercase tracking-[0.2em] text-on-gold hover:bg-gold-bright"
          >
            Next →
          </button>
        )}
      </div>
    </dialog>
  );
}
