import Link from "next/link";
import type { ReactNode } from "react";

// Renders blog paragraphs: "## " starts a subheading, [text](url) is a link (site links stay on the site).
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]{1,200})\]\(((?:https?:\/\/|\/)[^\s)]{0,500})\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    const cls = "font-semibold text-[#5CC4F2] underline decoration-[#5CC4F2]/40 underline-offset-2 hover:text-white";
    out.push(
      href.startsWith("/") || href.startsWith("https://brandonsbrands17.com") ? (
        <Link key={`${keyBase}-${i++}`} href={href.replace("https://brandonsbrands17.com", "") || "/"} className={cls}>
          {label}
        </Link>
      ) : (
        <a key={`${keyBase}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function BlogBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-8 space-y-6 text-base leading-8 text-slate-300">
      {paragraphs.map((p, i) =>
        p.startsWith("## ") ? (
          <h2 key={i} className="pt-4 text-2xl font-semibold tracking-[-0.02em] text-white">
            {p.slice(3)}
          </h2>
        ) : (
          <p key={i}>{inline(p, String(i))}</p>
        ),
      )}
    </div>
  );
}

// Plain text version (for search and descriptions).
export function plainText(p: string): string {
  return p.replace(/^## /, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
