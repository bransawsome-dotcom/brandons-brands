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

// Grouped subject picker: plain subjects, then Watch Brands and Watch Clubs sub-folders.
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
  const plain = tree.top.filter((n) => !n.folder);
  const brands = tree.children.get(BRANDS_FOLDER) ?? [];
  const clubs = tree.children.get(CLUBS_FOLDER) ?? [];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <optgroup label="Subjects">
        {plain.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.icon} {s.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Watch Brands">
        {brands.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Watch Clubs & Meetups">
        <option value={CLUBS_FOLDER}>General clubs &amp; meetups</option>
        {clubs.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </optgroup>
      {allowNew ? (
        <optgroup label="Not listed?">
          <option value={NEW_SUBJECT}>+ Add a new subject or club…</option>
        </optgroup>
      ) : null}
    </select>
  );
}
