"use client";

import { useEffect, useState } from "react";

// A steel vault door that opens over the Collection page on the first visit of the day:
// the wheel spins, the bolts slide back and the door swings open (about 1.2 seconds).
// Tap to skip. Shown at most once a day per browser, and never to people who ask their
// device to reduce motion.
const KEY = "bb-vault-opened";
const BOLTS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function VaultIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let today = "";
    try {
      today = new Date().toLocaleDateString("en-CA");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (localStorage.getItem(KEY) === today) return;
      localStorage.setItem(KEY, today);
    } catch {
      return;
    }
    Promise.resolve().then(() => setShow(true));
    const t = window.setTimeout(() => setShow(false), 1350);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      className="bb-vault fixed inset-0 z-[200] flex cursor-pointer items-center justify-center bg-[#050a14]"
      onClick={() => setShow(false)}
      role="presentation"
      aria-hidden
    >
      <div className="bb-vault-frame relative" style={{ width: "min(72vmin, 420px)", height: "min(72vmin, 420px)", perspective: "1200px" }}>
        {/* The opening in the wall, seen once the door swings away. */}
        <div className="absolute inset-[6%] rounded-full bg-gradient-to-br from-[#0E3A63] via-[#0b1626] to-black shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]" />
        <div className="bb-vault-door absolute inset-0">
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <defs>
              <radialGradient id="bbSteel" cx="40%" cy="35%" r="75%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="45%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>
              <linearGradient id="bbRim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Bolts sit under the door edge and slide back toward the center. */}
            {BOLTS.map((a) => (
              <g key={a} transform={`rotate(${a} 100 100)`}>
                <rect className="bb-vault-bolt" x="170" y="94" width="26" height="12" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              </g>
            ))}
            <circle cx="100" cy="100" r="88" fill="url(#bbRim)" />
            <circle cx="100" cy="100" r="80" fill="url(#bbSteel)" stroke="#1e293b" strokeWidth="2" />
            <circle cx="100" cy="100" r="64" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.7" />
            {Array.from({ length: 16 }, (_, i) => (
              <circle key={i} cx={100 + 72 * Math.cos((i * Math.PI) / 8)} cy={100 + 72 * Math.sin((i * Math.PI) / 8)} r="2.2" fill="#64748b" />
            ))}
            {/* The wheel. */}
            <g className="bb-vault-wheel">
              {[0, 60, 120].map((a) => (
                <g key={a} transform={`rotate(${a} 100 100)`}>
                  <rect x="56" y="97" width="88" height="6" rx="3" fill="#D9A43A" stroke="#7c5a14" strokeWidth="0.8" />
                  <circle cx="56" cy="100" r="6" fill="#D9A43A" stroke="#7c5a14" strokeWidth="0.8" />
                  <circle cx="144" cy="100" r="6" fill="#D9A43A" stroke="#7c5a14" strokeWidth="0.8" />
                </g>
              ))}
              <circle cx="100" cy="100" r="16" fill="#D9A43A" stroke="#7c5a14" strokeWidth="1" />
              <circle cx="100" cy="100" r="7" fill="#0b1220" />
            </g>
          </svg>
        </div>
      </div>
      <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] uppercase tracking-[0.3em] text-slate-500">Opening your vault · tap to skip</p>
    </div>
  );
}
