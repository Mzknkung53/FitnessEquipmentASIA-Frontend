"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/**
 * Styled replacement for a native <select>: a button that opens a listbox panel.
 * Keyboard: Enter/Space/arrows open it, arrows move, Enter picks, Esc closes.
 */
export function SelectMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const current = options.find(([v]) => v === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, options.findIndex(([v]) => v === value)));
    setOpen(true);
  };
  const pick = (v: T) => {
    onChange(v);
    setOpen(false);
    button.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") e.preventDefault();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(options[active][0]);
    }
  };

  return (
    <div ref={root} className="relative flex items-center gap-2.5 text-sm" onKeyDown={onKeyDown}>
      <span id={`${id}-label`} className="text-muted">
        {label}
      </span>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : show())}
        className={`inline-flex min-h-[46px] items-center gap-3 rounded-full border-[1.5px] bg-white pr-3.5 pl-4.5 text-[15px] font-semibold hover:border-ink ${open ? "border-ink" : "border-control"}`}
      >
        <span id={`${id}-value`}>{current[1]}</span>
        <Icon name="chevron" size={16} strokeWidth={2.2} className={`transition-transform duration-300 ease-(--ease-spring) ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          className="drop-in absolute top-full right-0 z-20 mt-2 flex min-w-[220px] flex-col gap-0.5 rounded-xl border border-line bg-white p-1.5 shadow-[0_18px_40px_-14px_rgba(22,19,15,.35)]"
        >
          {options.map(([v, text], i) => {
            const selected = v === value;
            return (
              <li
                key={v}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(v)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg px-3.5 text-[15px] ${i === active ? "bg-stage" : ""} ${selected ? "font-semibold text-ink" : "text-ink-2"}`}
              >
                {text}
                {selected && <Icon name="check" size={16} strokeWidth={2.2} className="text-brand" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
