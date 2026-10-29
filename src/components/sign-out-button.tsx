"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

// Labels default to Thai for the staff area; the storefront passes its own language.
export function SignOutButton({
  className = "",
  label = "ออกจากระบบ",
  busyLabel = "กำลังออก…",
  home = "/",
}: {
  className?: string;
  label?: string;
  busyLabel?: string;
  home?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={async () => {
        setBusy(true);
        const supabase = createBrowserSupabase();
        await supabase.auth.signOut();
        router.refresh();
        router.push(home);
      }}
    >
      {busy ? busyLabel : label}
    </button>
  );
}
