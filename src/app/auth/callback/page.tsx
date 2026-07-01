"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");

      if (!code) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        router.replace("/login");
        return;
      }

      router.replace("/dashboard");
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Confirming your account...</p>
    </main>
  );
}