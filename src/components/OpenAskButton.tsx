"use client";

// A button that opens the site's message form (the Ask Brandon pop-up) instead of an email app.
export function openAskBrandon(opts: { topic?: string; contact?: boolean } = {}) {
  window.dispatchEvent(new CustomEvent("bb:ask", { detail: opts }));
}

export default function OpenAskButton({
  children,
  className = "",
  topic,
  contact = true,
}: {
  children: React.ReactNode;
  className?: string;
  topic?: string;
  contact?: boolean;
}) {
  return (
    <button type="button" onClick={() => openAskBrandon({ topic, contact })} className={className} aria-haspopup="dialog">
      {children}
    </button>
  );
}
