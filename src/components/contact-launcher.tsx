"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { contactChannels } from "@/lib/site";

/** One compact launcher instead of six floating social buttons. */
export function ContactLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <div id="contact-panel" className="w-[280px] rounded-xl border border-line bg-white p-4 shadow-[0_12px_32px_-4px_rgba(22,19,15,.3)]">
          <p className="pb-2 text-sm font-semibold">ติดต่อทีมงาน</p>
          {contactChannels.map((c) => (
            <a key={c.name} href={c.href ?? "/showroom#contact"} className="flex min-h-11 items-center justify-between border-b border-line px-1 text-[15px] last:border-0 hover:bg-stage">
              <span className="font-semibold">{c.name}</span>
              <span className="text-[13px] text-muted">{c.handle}</span>
            </a>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="contact-panel" className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-night px-5 font-semibold text-white shadow-[0_12px_32px_-6px_rgba(0,0,0,.45)]">
        <Icon name={open ? "x" : "chat"} />
        ติดต่อเรา
      </button>
    </div>
  );
}
