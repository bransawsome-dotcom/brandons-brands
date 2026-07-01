"use client";

import AuthProvider from "@/components/AuthProvider";

export default function AppAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
