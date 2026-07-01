"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  guestMode: boolean;
  loading: boolean;
  signInGuest: () => void;
  signOut: () => Promise<void>;
};

const GUEST_ID_KEY = "brandons_brands_guest_id";

function createGuestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedGuest = typeof window !== "undefined" && window.localStorage.getItem("brandons-brands-guest-mode") === "true";
    setGuestMode(storedGuest);

    if (!supabase) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    let subscribed = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!subscribed) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setGuestMode(Boolean(data.session?.user) ? false : storedGuest);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!subscribed) return;
      setSession(session);
      setUser(session?.user ?? null);
      setGuestMode(Boolean(session?.user) ? false : storedGuest);
      setLoading(false);
    });

    return () => {
      subscribed = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInGuest = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("brandons-brands-guest-mode", "true");
      if (!window.localStorage.getItem(GUEST_ID_KEY)) {
        window.localStorage.setItem(GUEST_ID_KEY, createGuestId());
      }
    }
    setGuestMode(true);
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("brandons-brands-guest-mode");
    }
    setGuestMode(false);
    if (!supabase) {
      setSession(null);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, session, guestMode, loading, signInGuest, signOut }),
    [user, session, guestMode, loading, signInGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user && !auth.guestMode) {
      router.push("/login");
    }
  }, [auth.loading, auth.user, auth.guestMode, router]);

  return auth;
}
