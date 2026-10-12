import Link from "next/link";

// "Message" button for a member found on the Collectors pages. Opens the inbox with that member
// (members only: logged-out visitors are asked to log in and then brought back here).
export default function MessageMemberButton({ handle, name, compact = false }: { handle: string; name: string; compact?: boolean }) {
  return (
    <Link
      href={`/inbox?member=${encodeURIComponent(handle)}`}
      rel="nofollow"
      aria-label={`Message ${name}`}
      className={`inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-raised font-semibold text-ink transition hover:border-gold hover:bg-surface ${
        compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
      }`}
    >
      <span aria-hidden>✉️</span> Message
    </Link>
  );
}
