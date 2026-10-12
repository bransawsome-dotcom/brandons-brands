"use client";

import { FormEvent, useState } from "react";

// A settings row showing a name with an Edit button that switches to an inline form.
export default function EditableNameRow({
  label,
  value,
  emptyText,
  hint,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  emptyText: string;
  hint?: string;
  placeholder?: string;
  onSave: (next: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-md bg-surface px-4 py-3 sm:items-center sm:gap-4">
        <div className="min-w-0">
          <span className="font-medium text-ink">{label}</span>
          {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
        </div>
        <div className="flex min-w-0 max-w-[55%] shrink-0 items-center gap-3">
          <span className={`min-w-0 text-right [overflow-wrap:anywhere] ${value ? "" : "whitespace-nowrap text-muted"}`}>{value || emptyText}</span>
          <button type="button" onClick={start} className="shrink-0 text-xs font-semibold text-gold hover:text-gold-bright">
            {value ? "Edit" : "Add"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-md bg-surface px-4 py-3">
      <label className="block space-y-2">
        <span className="font-medium text-ink">{label}</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={40}
          autoFocus
          placeholder={placeholder}
          className="w-full rounded border border-hairline bg-raised px-4 py-2.5 text-ink outline-none focus:border-gold/70"
        />
      </label>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-on-navy hover:bg-navy-deep disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
