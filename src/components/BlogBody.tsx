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
  // Consecutive "- " lines become one bulleted list.
  const blocks: (string | string[])[] = [];
  for (const p of paragraphs) {
    if (/^[-•] /.test(p)) {
      const last = blocks[blocks.length - 1];
      if (Array.isArray(last)) last.push(p.slice(2));
      else blocks.push([p.slice(2)]);
    } else blocks.push(p);
  }
  return (
    <div className="mt-8 space-y-6 text-base leading-8 text-slate-300">
      {blocks.map((p, i) =>
        Array.isArray(p) ? (
          <ul key={i} className="list-disc space-y-2 pl-6 marker:text-[#D9A43A]">
            {p.map((item, j) => (
              <li key={j}>{inline(item, `${i}-${j}`)}</li>
            ))}
          </ul>
        ) : p.startsWith("## ") ? (
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
  return p.replace(/^(## |[-•] )/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
