import { Suspense } from "react";
import type { Metadata } from "next";
import ForumHome from "./ForumHome";

export const metadata: Metadata = {
  title: "Community Forum | Brandon's Brands",
  description: "Talk watches with the Brandon's Brands community: Rolex, Omega, vintage, buying advice, wrist shots and more.",
};

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-300">Loading forum…</div>}>
      <ForumHome />
    </Suspense>
  );
}
