import { collabEmail } from "@/lib/socials";

// "Collaborations": a short note with a gold rule on the left, as on the reference design.
export default function CollabNote({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="collaborations" className={`border-l-2 border-gold pl-6 sm:pl-8 ${className}`}>
      <h2 id="collaborations" className="font-display text-3xl font-semibold uppercase leading-tight text-ink sm:text-4xl">
        Collaborations
      </h2>
      <p className="mt-2 text-lg text-ink/80">
        For collabs, write to{" "}
        <a href={`mailto:${collabEmail}`} className="break-all text-base tracking-[0.06em] text-gold underline-offset-4 hover:underline">
          {collabEmail}
        </a>
      </p>
    </section>
  );
}
