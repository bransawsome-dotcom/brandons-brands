"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRANDS_FOLDER, CLUBS_FOLDER, buildSubjectTree, listCustomSubjects, type CustomSubject, type SubjectTree } from "@/lib/forum";

// Loads member-created subjects and clubs and builds the full subject tree.
export function useSubjectTree(): { tree: SubjectTree; reload: () => Promise<void> } {
  const [custom, setCustom] = useState<CustomSubject[]>([]);
  const reload = useCallback(async () => {
    setCustom(await listCustomSubjects());
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  const tree = useMemo(() => buildSubjectTree(custom), [custom]);
  return { tree, reload };
}

export const NEW_SUBJECT = "__new";

// Subject picker: each main subject, with its sub-folders listed underneath it.
export function SubjectSelect({
  tree,
  value,
  onChange,
  allowNew,
  className,
}: {
  tree: SubjectTree;
  value: string;
  onChange: (slug: string) => void;
  allowNew?: boolean;
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {tree.top.map((s) => {
        const kids = tree.children.get(s.slug) ?? [];
        if (!kids.length) {
          return (
            <option key={s.slug} value={s.slug}>
              {s.icon} {s.name}
            </option>
          );
        }
        return (
          <optgroup key={s.slug} label={s.name}>
            {/* Watch Brands posts go into a brand (or Miscellaneous); other subjects can also take posts directly. */}
            {s.slug !== BRANDS_FOLDER ? (
              <option value={s.slug}>
                {s.icon} {s.name}
                {s.slug === CLUBS_FOLDER ? " (general)" : ""}
              </option>
            ) : null}
            {kids.map((k) => (
              <option key={k.slug} value={k.slug}>
                {"\u00A0\u00A0\u21B3 "}
                {k.name}
              </option>
            ))}
          </optgroup>
        );
      })}
      {allowNew ? (
        <optgroup label="Not listed?">
          <option value={NEW_SUBJECT}>+ Add a new topic or sub-folder…</option>
        </optgroup>
      ) : null}
    </select>
  );
}
