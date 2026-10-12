import { Suspense } from "react";
import type { Metadata } from "next";
import InboxView from "./InboxView";

export const metadata: Metadata = {
  title: "Inbox | Brandon's Brands",
};

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-ink/80">Loading inbox…</div>}>
      <InboxView />
    </Suspense>
  );
}
