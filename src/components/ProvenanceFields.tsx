"use client";

import Combobox from "@/components/Combobox";
import { AUTHENTICATORS } from "@/lib/localData";

export type Provenance = {
  has_box: boolean;
  has_papers: boolean;
  authenticated: boolean;
  authenticated_by: string;
};

export const emptyProvenance: Provenance = { has_box: false, has_papers: false, authenticated: false, authenticated_by: "" };

export function provenanceFrom(w: Partial<Record<keyof Provenance, unknown>>): Provenance {
  return {
    has_box: Boolean(w.has_box),
    has_papers: Boolean(w.has_papers),
    authenticated: Boolean(w.authenticated || w.authenticated_by),
    authenticated_by: typeof w.authenticated_by === "string" ? w.authenticated_by : "",
  };
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        checked ? "border-[#D9A43A]/60 bg-[#D9A43A]/10 text-white" : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#D9A43A]" />
      <span>
        <span className="font-semibold">{label}</span>
        {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
      </span>
    </label>
  );
}

// Box & papers and third-party authentication, shown right after Condition.
export default function ProvenanceFields({ value, onChange }: { value: Provenance; onChange: (next: Provenance) => void }) {
  const set = (patch: Partial<Provenance>) => onChange({ ...value, ...patch });
  return (
    <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <legend className="px-1 text-sm text-slate-300">Box, papers &amp; authentication</legend>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        <Toggle label="Original box" checked={value.has_box} onChange={(v) => set({ has_box: v })} />
        <Toggle label="Original papers" hint="Warranty card / certificate" checked={value.has_papers} onChange={(v) => set({ has_papers: v })} />
        <Toggle
          label="Third-party authenticated"
          checked={value.authenticated}
          onChange={(v) => set({ authenticated: v, authenticated_by: v ? value.authenticated_by : "" })}
        />
      </div>
      {value.authenticated ? (
        <Combobox
          label="Authenticated by"
          name="authenticated_by"
          value={value.authenticated_by}
          options={AUTHENTICATORS}
          placeholder="Choose or type who authenticated it"
          onChange={(v) => set({ authenticated_by: v })}
        />
      ) : null}
    </fieldset>
  );
}
