"use client";

import { useEffect, useState } from "react";
import { takeVaultRequest } from "@/lib/vault";

// A bank-vault door that opens over the Collection page when someone clicks a Collection button: the
// combination dial and wheel spin, the round locking bolts slide back, and the thick steel door
// swings open on its hinge to a gold-lit vault (about 2 seconds). Tap to skip. Never shown on a
// refresh or when coming back from another page, or to people who ask their device to reduce motion.
const LOCK_BOLTS = Array.from({ length: 12 }, (_, i) => i * 30 + 15);
const RIM_BOLTS = Array.from({ length: 28 }, (_, i) => (i * 360) / 28);
const SPOKES = Array.from({ length: 16 }, (_, i) => i * 22.5);
const DEPTH = 10; // layers that give the door its thickness

// Brandon's logo bursting out of the vault as the door opens: [angle°, distance, size (% of the stage), spin°, delay s, unused]
const BURST: [number, number, number, number, number, number][] = [
  [-90, 58, 22, -25, 0.0, 0], [-40, 64, 18, 30, 0.04, 1], [10, 60, 21, -40, 0.08, 2], [55, 66, 17, 20, 0.02, 0],
  [100, 56, 20, -15, 0.1, 1], [145, 64, 18, 35, 0.05, 2], [190, 60, 21, -30, 0.12, 0], [235, 66, 17, 25, 0.07, 1],
  [-65, 38, 14, 45, 0.16, 2], [30, 40, 15, -50, 0.18, 1], [120, 42, 14, 40, 0.15, 0], [210, 38, 15, -35, 0.2, 2],
];

const pol = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a) };
};

export default function VaultIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only right after a Collection button was clicked (not on refresh or coming back from another page).
    if (!takeVaultRequest()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    Promise.resolve().then(() => setShow(true));
    const t = window.setTimeout(() => setShow(false), 2000);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      className="bb-vault fixed inset-0 z-[200] flex cursor-pointer items-center justify-center overflow-hidden"
      onClick={() => setShow(false)}
      role="presentation"
      aria-hidden
      style={{ background: "radial-gradient(circle at 50% 45%, #2a313b 0%, #12161c 55%, #07090c 100%)" }}
    >
      <div className="relative" style={{ width: "min(84vmin, 480px)", height: "min(84vmin, 480px)", perspective: "1400px" }}>
        {/* The wall frame and the lit vault behind the door. */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="bbVaultInside" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#f5d58a" />
              <stop offset="45%" stopColor="#b8862e" />
              <stop offset="100%" stopColor="#2a1c08" />
            </radialGradient>
            <linearGradient id="bbFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="35%" stopColor="#94a3b8" />
              <stop offset="65%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <clipPath id="bbVaultOpening">
              <circle cx="100" cy="100" r="91" />
            </clipPath>
          </defs>
          <circle cx="100" cy="100" r="99" fill="url(#bbFrame)" />
          <circle cx="100" cy="100" r="93" fill="#1e293b" />
          <circle cx="100" cy="100" r="91" fill="url(#bbVaultInside)" />
          {/* Gate bars and shelves inside the vault. */}
          <g clipPath="url(#bbVaultOpening)">
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={48 + i * 10.4} y="20" width="2.2" height="160" fill="#3b2a10" opacity="0.55" />
          ))}
          <rect x="20" y="120" width="160" height="3" fill="#3b2a10" opacity="0.45" />
          <rect x="20" y="70" width="160" height="2.5" fill="#3b2a10" opacity="0.35" />
          </g>
          {/* Bolt sockets in the frame. */}
          {LOCK_BOLTS.map((a) => {
            const p = pol(95.5, a);
            return <circle key={a} cx={p.x} cy={p.y} r="3.6" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />;
          })}
        </svg>

        {/* The door: a stack of layers for thickness, then the front face. */}
        <div className="bb-vault-door absolute" style={{ inset: "3.5%", transformStyle: "preserve-3d" }}>
          {Array.from({ length: DEPTH }, (_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                transform: `translateZ(${-(i + 1) * 3}px)`,
                background: i === DEPTH - 1 ? "#1e293b" : `linear-gradient(90deg, #cbd5e1, #64748b 40%, #e2e8f0 70%, #475569)`,
              }}
            />
          ))}
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(0)" }}>
            <defs>
              <radialGradient id="bbSteelFace" cx="38%" cy="32%" r="80%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="30%" stopColor="#cbd5e1" />
                <stop offset="65%" stopColor="#8b97a8" />
                <stop offset="100%" stopColor="#3f4a5a" />
              </radialGradient>
              <radialGradient id="bbChrome" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>
              <radialGradient id="bbBrass" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fff3c4" />
                <stop offset="45%" stopColor="#d9a43a" />
                <stop offset="100%" stopColor="#6b4a10" />
              </radialGradient>
              <linearGradient id="bbBolt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="30%" stopColor="#f1f5f9" />
                <stop offset="55%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            {/* Round locking bolts: they stick out of the door edge into the frame, then slide back. */}
            {LOCK_BOLTS.map((a) => (
              <g key={a} transform={`rotate(${a} 100 100)`}>
                <rect className="bb-vault-bolt" x="178" y="95" width="21" height="10" rx="5" fill="url(#bbBolt)" stroke="#1e293b" strokeWidth="0.5" />
              </g>
            ))}

            {/* Door face: brushed steel with circular grain. */}
            <circle cx="100" cy="100" r="96" fill="url(#bbSteelFace)" stroke="#1e293b" strokeWidth="1.2" />
            {Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx="100" cy="100" r={95 - i * 3.1} fill="none" stroke={i % 2 ? "#ffffff" : "#0f172a"} strokeWidth="0.35" opacity="0.12" />
            ))}

            {/* Outer ring with big chrome bolt heads. */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#334155" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="#1e293b" strokeWidth="1.4" />
            <circle cx="100" cy="100" r="77" fill="none" stroke="#e2e8f0" strokeWidth="0.6" opacity="0.7" />
            {RIM_BOLTS.map((a) => {
              const p = pol(84, a);
              return (
                <g key={a}>
                  <circle cx={p.x + 0.6} cy={p.y + 0.8} r="4.4" fill="#0f172a" opacity="0.45" />
                  <circle cx={p.x} cy={p.y} r="4.2" fill="url(#bbChrome)" stroke="#334155" strokeWidth="0.4" />
                </g>
              );
            })}

            {/* Stepped inner rings and the spoked panel. */}
            <circle cx="100" cy="100" r="70" fill="#64748b" opacity="0.25" />
            <circle cx="100" cy="100" r="68" fill="none" stroke="#0f172a" strokeWidth="1.6" opacity="0.6" />
            <circle cx="100" cy="100" r="66" fill="none" stroke="#f8fafc" strokeWidth="0.6" opacity="0.6" />
            {SPOKES.map((a) => {
              const p1 = pol(30, a);
              const p2 = pol(64, a);
              return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />;
            })}
            {SPOKES.map((a) => {
              const p1 = pol(30, a + 0.8);
              const p2 = pol(64, a + 0.8);
              return <line key={`h${a}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f8fafc" strokeWidth="0.6" opacity="0.45" />;
            })}
            <circle cx="100" cy="100" r="31" fill="url(#bbSteelFace)" stroke="#1e293b" strokeWidth="1.2" />

            {/* Combination dial (spins first). */}
            <g className="bb-vault-dial">
              <circle cx="100" cy="100" r="27" fill="#0f172a" />
              <circle cx="100" cy="100" r="25.5" fill="url(#bbChrome)" />
              {Array.from({ length: 40 }, (_, i) => {
                const p1 = pol(25, i * 9);
                const p2 = pol(i % 5 ? 22.5 : 20.5, i * 9);
                return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1e293b" strokeWidth={i % 5 ? 0.4 : 0.8} />;
              })}
            </g>

            {/* Handle wheel: three chrome bars with brass knobs (spins to unlock). */}
            <g className="bb-vault-wheel">
              {[0, 60, 120].map((a) => (
                <g key={a} transform={`rotate(${a} 100 100)`}>
                  <rect x="44" y="97.6" width="112" height="4.8" rx="2.4" fill="url(#bbBolt)" stroke="#1e293b" strokeWidth="0.4" />
                  <circle cx="44" cy="100" r="5.6" fill="url(#bbBrass)" stroke="#5b3d0a" strokeWidth="0.5" />
                  <circle cx="156" cy="100" r="5.6" fill="url(#bbBrass)" stroke="#5b3d0a" strokeWidth="0.5" />
                </g>
              ))}
              <circle cx="100" cy="100" r="11" fill="url(#bbChrome)" stroke="#1e293b" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="5" fill="url(#bbBrass)" stroke="#5b3d0a" strokeWidth="0.5" />
            </g>

            {/* Soft light across the face. */}
            <ellipse cx="72" cy="58" rx="58" ry="30" fill="#ffffff" opacity="0.08" transform="rotate(-30 72 58)" />
          </svg>
        </div>

        {/* Brandon's logo bursting out of the open vault toward the viewer. */}
        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {BURST.map(([deg, dist, size, spin, delay], i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <div
                key={i}
                className="bb-vault-clock absolute"
                style={
                  {
                    left: `${50 - size / 2}%`,
                    top: `${50 - size / 2}%`,
                    width: `${size}%`,
                    height: `${size}%`,
                    "--bb-dx": `${Math.cos(rad) * dist * 4.8}px`,
                    "--bb-dy": `${Math.sin(rad) * dist * 4.8}px`,
                    "--bb-spin": `${spin * 6}deg`,
                    animationDelay: `${1.0 + delay}s`,
                  } as React.CSSProperties
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-256.webp" alt="" draggable={false} className="h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
              </div>
            );
          })}
        </div>

        {/* Hinge on the left. */}
        <div className="absolute left-[1%] top-[30%] h-[40%] w-[5%] rounded-md" style={{ background: "linear-gradient(90deg,#334155,#e2e8f0 45%,#64748b)" }} />
      </div>
      <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] uppercase tracking-[0.3em] text-slate-400">Opening your vault · tap to skip</p>
    </div>
  );
}
