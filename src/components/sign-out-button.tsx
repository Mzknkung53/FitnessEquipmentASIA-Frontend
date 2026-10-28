"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton({ className = "" }: { className?: string }) {
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
        router.push("/");
      }}
    >
      {busy ? "กำลังออก…" : "ออกจากระบบ"}
    </button>
  );
}
