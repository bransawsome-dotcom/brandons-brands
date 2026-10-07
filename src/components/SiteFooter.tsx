import { collabEmail, socials } from "@/lib/socials";

export default function SiteFooter() {
  return (
    <footer className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Follow Brandon&apos;s Brands</p>
          <p className="mt-2 text-sm text-slate-300">
            Collabs:{" "}
            <a href={`mailto:${collabEmail}`} className="text-[#D9A43A] transition hover:text-[#e1b54a]">
              {collabEmail}
            </a>
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.name} ${s.handle}`}
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-[#D9A43A]/40 hover:text-[#D9A43A]"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
