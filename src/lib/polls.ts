// "Which would you pick?" polls: two watches, one tap to vote, results right away.
export type Poll = {
  id: string;
  question: string;
  a_label: string;
  a_image: string | null;
  b_label: string;
  b_image: string | null;
  active: boolean;
  created_at: string;
};
export type PollResults = { a: number; b: number; mine: 0 | 1 | null };

// Public list for server pages (public key, cached a minute). Empty if not set up.
export async function loadPolls(limit = 20): Promise<Poll[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/polls?select=*&order=created_at.desc&limit=${limit}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60, tags: ["polls"] },
    });
    return res.ok ? ((await res.json()) as Poll[]) : [];
  } catch {
    return [];
  }
}

// Vote totals for a poll, for server pages (so finished polls show their results as plain, searchable text).
export async function loadPollResults(pollId: string): Promise<{ a: number; b: number } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/poll_results`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_poll: pollId, p_voter: null }),
      next: { revalidate: 300, tags: ["polls"] },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { a?: number; b?: number } | { a?: number; b?: number }[];
    const r = Array.isArray(d) ? d[0] : d;
    return { a: Number(r?.a ?? 0), b: Number(r?.b ?? 0) };
  } catch {
    return null;
  }
}

// A random id kept in this browser so visitors can vote once per poll without an account.
export function voterId(): string {
  try {
    let id = localStorage.getItem("bb-voter");
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/[^a-z0-9-]/gi, "").slice(0, 60);
      localStorage.setItem("bb-voter", id);
    }
    return id;
  } catch {
    return `s-${Math.random().toString(36).slice(2)}`;
  }
}
