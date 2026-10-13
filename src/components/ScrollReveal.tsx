"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Sections, cards and list items below the fold fade up gently as they scroll into view.
// Things already on screen when the page opens are left alone (no flash), content that loads later
// is picked up automatically, and nothing moves for people who ask their device to reduce motion.
const TARGETS = "main section, main article, main ul.grid > li, main [data-reveal]";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          // Items in the same row come in one after another.
          const row = el.parentElement ? [...el.parentElement.children].indexOf(el) % 3 : 0;
          el.style.transitionDelay = `${row * 70}ms`;
          el.classList.add("bb-in");
          io.unobserve(el);
        }
      },
      // threshold 0: a section taller than the screen (long forum lists on a phone) still counts as in view.
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
        if (seen.has(el) || el.closest(".bb-reveal")) continue;
        seen.add(el);
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) continue; // already visible
        el.classList.add("bb-reveal");
        io.observe(el);
      }
    };
    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(scan, 120);
    });
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    // Safety net: anything still hidden after a few seconds is shown, so content can never stay invisible.
    const failsafe = window.setTimeout(() => {
      for (const el of document.querySelectorAll<HTMLElement>(".bb-reveal:not(.bb-in)")) el.classList.add("bb-in");
    }, 3500);
    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
