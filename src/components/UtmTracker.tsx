"use client";

import { useEffect } from "react";

// Records where a visitor came from when they land with utm_* tags
// (e.g. ?utm_source=youtube&utm_medium=shorts&utm_campaign=ressence), or on a /from/<platform> page.
// Sent once per browser session, without cookies. Totals show on /traffic for moderators.
const FROM_PAGES = ["instagram", "tiktok", "youtube", "facebook"];

export default function UtmTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("bb_utm_sent")) return;
      const url = new URL(window.location.href);
      const q = url.searchParams;
      let source = q.get("utm_source") ?? "";
      let medium = q.get("utm_medium") ?? "";
      const fromMatch = url.pathname.match(/^\/from\/([a-z]+)/);
      if (!source && fromMatch && FROM_PAGES.includes(fromMatch[1])) {
        source = fromMatch[1];
        medium = "bio-link";
      }
      if (!source) return;
      let ref = "";
      try {
        ref = document.referrer ? new URL(document.referrer).hostname : "";
      } catch {}
      const payload = JSON.stringify({
        source,
        medium,
        campaign: q.get("utm_campaign") ?? "",
        content: q.get("utm_content") ?? "",
        term: q.get("utm_term") ?? "",
        path: url.pathname,
        ref,
      });
      const sent =
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon("/api/utm", new Blob([payload], { type: "application/json" }));
      if (!sent) void fetch("/api/utm", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
      sessionStorage.setItem("bb_utm_sent", "1");
    } catch {
      // Private mode or blocked storage: skip quietly.
    }
  }, []);
  return null;
}
