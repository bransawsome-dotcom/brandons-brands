"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// "Ask Brandon": a floating pill on every page that opens a short form. Questions are emailed to Brandon.
// Any "Contact us" / "Message us" button can open the same form with openAskBrandon() (see OpenAskButton).
const TOPICS = ["Buying advice", "A listing I found", "My collection", "Collab", "Something else"];
export const ASK_EVENT = "bb:ask";
const HIDE_ON = [/^\/connect/, /^\/admin/, /^\/inbox/];

export default function AskBrandon() {
  const path = usePathname() ?? "/";
  const dialog = useRef<HTMLDialogElement>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [contact, setContact] = useState(false); // opened from a Contact us / Message us button
  const { user } = useAuth();
  const knownName = (user?.user_metadata?.account_name as string | undefined) ?? "";
  const knownEmail = user?.email ?? "";

  useEffect(() => {
    const onAsk = (e: Event) => {
      const d = (e as CustomEvent<{ topic?: string; contact?: boolean }>).detail ?? {};
      setContact(Boolean(d.contact));
      if (d.topic && TOPICS.includes(d.topic)) setTopic(d.topic);
      setError("");
      setState((s) => (s === "sent" ? "idle" : s));
      dialog.current?.showModal();
    };
    window.addEventListener(ASK_EVENT, onAsk);
    // Links to /about#contact or any page with #message open the form straight away.
    const fromHash = () => {
      if (window.location.hash === "#contact" || window.location.hash === "#message")
        window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { contact: true, topic: "Something else" } }));
    };
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener(ASK_EVENT, onAsk);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const close = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", close);
    return () => d.removeEventListener("click", close);
  }, []);

  // Client-side page changes to a #contact / #message link open the form too.
  useEffect(() => {
    if (window.location.hash !== "#contact" && window.location.hash !== "#message") return;
    const t = window.setTimeout(() => window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { contact: true, topic: "Something else" } })), 400);
    return () => window.clearTimeout(t);
  }, [path]);

  const hidePill = HIDE_ON.some((r) => r.test(path));

  const open = () => {
    setContact(false);
    setError("");
    if (state === "sent") setState("idle");
    dialog.current?.showModal();
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(f), topic, page: path }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setState("sent");
      (e.target as HTMLFormElement).reset();
    } else {
      setState("idle");
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

  const field =
    "mt-1.5 w-full rounded border border-hairline-strong bg-raised px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none";

  return (
    <>
      {hidePill ? null : <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Ask Brandon a question"
        className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-ink/70 bg-raised py-2.5 pl-3.5 pr-5 text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover md:bottom-6 md:right-6"
      >
        <span aria-hidden className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-700/15">
          <span className="h-2 w-2 rounded-full bg-emerald-700" />
        </span>
        <span className="font-serif text-xl italic leading-none">Ask Brandon</span>
      </button>}

      <dialog
        ref={dialog}
        aria-labelledby="ask-title"
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-md border border-hairline bg-ground p-0 text-ink shadow-[0_30px_80px_rgba(27,42,65,0.35)] backdrop:bg-[#1b2a41]/50 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 sm:p-8">
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="absolute right-4 top-4 h-9 w-9 rounded-full text-xl text-muted hover:bg-surface hover:text-ink">
            ×
          </button>
          <span aria-hidden className="block h-px w-10 bg-gold" />
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gold">{contact ? "Contact us" : "Ask Brandon"}</p>
          <h2 id="ask-title" className="mt-2 font-display text-4xl font-semibold uppercase leading-[1.05]">
            {contact ? (
              <>
                Send us a <span className="font-light text-gold">message</span>
              </>
            ) : (
              <>
                A question about <span className="font-light text-gold">watches?</span>
              </>
            )}
          </h2>
          <p className="mt-3 font-serif text-lg italic text-ink/80">
            {contact ? "It goes straight to Brandon's Brands, and we reply by email." : "Brandon reads every message and replies by email."}
          </p>

          {state === "sent" ? (
            <div className="mt-6 rounded border border-hairline bg-raised p-5" role="status">
              <p className="font-display text-2xl font-semibold uppercase">Sent to Brandon</p>
              <p className="mt-2 text-sm text-ink/80">Thanks! Watch your inbox for his reply.</p>
              <button type="button" onClick={() => dialog.current?.close()} className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-bright">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Name
                  <input name="name" required minLength={2} maxLength={80} autoComplete="name" defaultValue={knownName} className={field} />
                </label>
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Email
                  <input name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={knownEmail} className={field} />
                </label>
              </div>
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.2em] text-muted">Topic</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      onClick={() => setTopic(t)}
                      className={`min-h-9 rounded-full border px-3.5 text-xs transition ${
                        topic === t ? "border-gold bg-navy text-on-navy" : "border-hairline-strong text-ink hover:border-gold"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
                {contact ? "Your message" : "Your question"}
                <textarea name="question" required minLength={10} maxLength={2000} rows={4} className={`${field} resize-y normal-case tracking-normal`} />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              {error ? (
                <p role="alert" className="text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={state === "sending"}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy transition hover:bg-navy-deep disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : contact ? "Send message" : "Send to Brandon"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
