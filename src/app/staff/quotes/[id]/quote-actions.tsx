"use client";

import { useState, useTransition } from "react";
import { setQuoteStatus } from "@/app/staff/quotes/actions";
import type { QuoteStatus } from "@/app/staff/quotes/quote-meta";
import { useStaffI18n } from "@/app/staff/staff-i18n";

const primary = "inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60";
const secondary = "inline-flex min-h-11 items-center rounded-lg border border-[#3d3934] px-4 text-sm font-semibold hover:border-white disabled:opacity-60";
const quiet = "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted-night hover:text-white disabled:opacity-60";

/** Status buttons that make sense for the current status only. */
export function QuoteActions({ quoteId, status }: { quoteId: string; status: QuoteStatus }) {
  const { t } = useStaffI18n();
  const a = t.actions;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [askReason, setAskReason] = useState(false);
  const [reason, setReason] = useState("");

  const go = (next: QuoteStatus, lostReason?: string) => {
    setError(null);
    start(async () => {
      const r = await setQuoteStatus(quoteId, next, lostReason);
      if (!r.ok) setError(r.error);
      else setAskReason(false);
    });
  };

  if (askReason) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go("lost", reason);
        }}
        className="flex w-full flex-col gap-2 sm:w-auto"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {a.whyLost} <span className="font-normal text-muted-night">{a.whyLostHint}</span>
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={a.lostExample}
            maxLength={500}
            className="min-h-11 rounded-lg border border-[#3d3934] bg-[#151311] px-3 text-[15px] font-normal sm:w-80"
          />
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={primary}>
            {a.confirmLost}
          </button>
          <button type="button" onClick={() => setAskReason(false)} className={quiet}>
            {a.cancel}
          </button>
        </div>
        {error && <p role="alert" className="text-sm text-[#ff8a8f]">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {status === "new" && (
          <button type="button" disabled={pending} onClick={() => go("reviewing")} className={primary}>
            {a.takeOn}
          </button>
        )}
        {status === "quoted" && (
          <button type="button" disabled={pending} onClick={() => go("won")} className={primary}>
            {a.won}
          </button>
        )}
        {(status === "new" || status === "reviewing" || status === "quoted") && (
          <>
            <button type="button" disabled={pending} onClick={() => setAskReason(true)} className={secondary}>
              {a.lost}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm(a.cancelConfirm)) go("cancelled");
              }}
              className={quiet}
            >
              {a.cancelRequest}
            </button>
          </>
        )}
        {(status === "won" || status === "lost" || status === "cancelled") && (
          <button type="button" disabled={pending} onClick={() => go("reviewing")} className={secondary}>
            {a.reopen}
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-[#ff8a8f]">{error}</p>}
    </div>
  );
}
