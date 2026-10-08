"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  label: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  emptyHint?: string;
  onChange: (value: string) => void;
  // Called when the person picks an option from the list (not when typing).
  onSelect?: (value: string) => void;
};

// A dropdown you can also type into: click to see every option, type to filter,
// arrow keys + Enter to choose, or keep typing to enter something not on the list.
export default function Combobox({ label, name, value, options, placeholder, required, disabled, emptyHint, onChange, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (showAll || !q) return options;
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const contains = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [options, value, showAll]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (option: string) => {
    onChange(option);
    onSelect?.(option);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative space-y-2 text-sm text-slate-300">
      <label htmlFor={`${id}-input`}>{label}</label>
      <div className="relative">
        <input
          id={`${id}-input`}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          placeholder={placeholder}
          onFocus={() => {
            setShowAll(true);
            setActive(0);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setShowAll(false);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 pr-11 text-white outline-none transition focus:border-blue-400/70 disabled:opacity-50"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Show ${label.toLowerCase()} options`}
          disabled={disabled}
          onClick={() => {
            setShowAll(true);
            setOpen((o) => !o);
          }}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-white disabled:opacity-50"
        >
          ▾
        </button>
      </div>
      {open && !disabled ? (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-950 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          {filtered.length ? (
            filtered.map((option, i) => (
              <li
                key={option}
                data-index={i}
                role="option"
                aria-selected={option === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer rounded-xl px-3 py-2 ${i === active ? "bg-blue-500/20 text-white" : "text-slate-200"} ${option === value ? "font-semibold text-[#D9A43A]" : ""}`}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-slate-400">
              {value.trim() ? `Not in the list — "${value.trim()}" will be used as typed.` : emptyHint ?? "No options"}
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
