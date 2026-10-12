import { Suspense } from "react";
import type { Metadata } from "next";
import ForumHome from "./ForumHome";
import { SkeletonList } from "@/components/Skeleton";

export const metadata: Metadata = {
  title: "Community Forum | Brandon's Brands",
  description: "Talk watches with the Brandon's Brands community: Rolex, Omega, vintage, buying advice, wrist shots and more.",
  alternates: { canonical: "/forum" },
};

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6"><SkeletonList label="Loading forum" /></div>}>
      <ForumHome />
    </Suspense>
  );
}
