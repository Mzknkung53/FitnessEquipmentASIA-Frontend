"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function GoogleSignInButton({
  next = "/account",
  label = "เข้าสู่ระบบด้วย Google",
  busyLabel = "กำลังเปิด Google…",
  errorLabel = "เข้าสู่ระบบไม่สำเร็จ",
  className = "",
}: {
  next?: string;
  label?: string;
  busyLabel?: string;
  errorLabel?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams: { prompt: "select_account" } },
      });
      if (authError) setError(authError.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : errorLabel);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-white px-5 text-[15px] font-semibold text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)] ring-1 ring-[#dadce0] transition hover:bg-[#f8f9fa] disabled:opacity-60 ${className}`}
      >
        <GoogleMark />
        {busy ? busyLabel : label}
      </button>
      {error && <p className="text-sm text-brand">{error}</p>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
