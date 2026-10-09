"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isModerator } from "@/lib/forum";

// Shown on /blog to moderators only: shortcut to the weekly drafts.
export default function DraftsLink() {
  const { user } = useAuth();
  const [mod, setMod] = useState(false);
  useEffect(() => {
    void isModerator(user?.id).then(setMod);
  }, [user?.id]);
  if (!mod) return null;
  return (
    <Link
      href="/blog/drafts"
      className="mt-5 inline-flex rounded-full border border-[#D9A43A]/50 px-4 py-2 text-sm font-semibold text-[#D9A43A] hover:bg-[#D9A43A]/10"
    >
      ✍️ Blog & social drafts (team only)
    </Link>
  );
}
