import { Suspense } from "react";
import type { Metadata } from "next";
import InboxView from "./InboxView";

export const metadata: Metadata = {
  title: "Inbox | Brandon's Brands",
};

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-300">Loading inbox…</div>}>
      <InboxView />
    </Suspense>
  );
}
