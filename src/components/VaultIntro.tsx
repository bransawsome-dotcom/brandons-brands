"use client";

import { useEffect, useRef, useState } from "react";
import LogoMark from "@/components/LogoMark";
import { takeVaultRequest, vaultFilm } from "@/lib/vault";

// The vault intro on the Collection page, shown only right after someone clicks a Collection button:
// the same bank-vault film as the home page plays full screen (sped up; licensed Pond5 clip #310790989) as the heavy door swings open,
// then Brandon's logo spins out of the vault toward you. Tap to skip. Never shown on a refresh, when
// coming back from another page, or to people who ask their device to reduce motion.
const SPEED = 2; // the 8s film plays in about 4s
const LOGO_AT_FILM = 5.2; // film time (s) when the door is open and the logo comes out

export default function VaultIntro() {
  const [show, setShow] = useState(false);
  const [logo, setLogo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!takeVaultRequest()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    Promise.resolve().then(() => setShow(true));
  }, []);

  useEffect(() => {
    if (!show) return;
    const v = video.current;
    const timers: number[] = [];
    let logoShown = false;
    const showLogo = () => {
      if (logoShown) return;
      logoShown = true;
      setLogo(true);
      // Hold the logo a moment, then fade into the page.
      timers.push(window.setTimeout(() => setLeaving(true), 1500));
      timers.push(window.setTimeout(() => setShow(false), 1950));
    };
    if (!v) {
      showLogo();
      return;
    }
    v.playbackRate = SPEED;
    // The logo comes out as the door finishes opening (about 5s into the film).
    const onTime = () => {
      if (v.currentTime >= LOGO_AT_FILM) showLogo();
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", showLogo);
    void v.play().catch(showLogo);
    // If the film is slow to arrive or can't play, carry on with the logo anyway.
    timers.push(window.setTimeout(() => {
      if (v.currentTime < 0.3) showLogo();
    }, 1600));
    timers.push(window.setTimeout(showLogo, 4200));
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", showLogo);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] cursor-pointer overflow-hidden bg-[#0b1424] transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
      onClick={() => setShow(false)}
      role="presentation"
      aria-hidden
    >
      <video
        ref={video}
        poster="/redesign/video/vault-poster.webp"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {vaultFilm().includes("640") ? null : <source src="/redesign/video/vault.webm" type="video/webm" />}
        <source src={vaultFilm()} type="video/mp4" />
      </video>
      {/* Navy and bronze grade over the film, darker at the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(11,20,36,0.75)_100%)]" />
      <div className="absolute inset-0 bg-[#1b2a41] mix-blend-color opacity-15" />

      {/* The logo is mounted (hidden) from the start so its photo is loaded and its hands already show the
          visitor's local time when it spins out of the vault. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ perspective: "900px" }}>
        <div className={`w-[min(70vw,560px)] ${logo ? "bb-vault-hero" : "opacity-0"}`}>
          <LogoMark variant="watch" priority className="block aspect-[1311/1134] w-full" imgClassName="drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
        </div>
      </div>

      <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] uppercase tracking-[0.3em] text-white/70">Opening your vault · tap to skip</p>
      <p className="absolute bottom-3 right-4 text-[9px] uppercase tracking-[0.12em] text-white/45">
        <a href="https://www.pond5.com/stock-footage/item/310790989-bank-vault-door-opening-revealing-gold-bars-inside" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-white/80">
          Vault footage by Inmicco · Pond5
        </a>
      </p>
    </div>
  );
}
