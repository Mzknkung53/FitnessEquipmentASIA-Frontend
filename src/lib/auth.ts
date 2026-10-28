import "server-only";
import { connection } from "next/server";
import { authConfigured } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthProfile = {
  userId: string;
  email: string | null;
  displayName: string | null;
  isStaff: boolean;
  role: "admin" | "sales" | "warehouse" | "service" | null;
};

/** Current session + synced customer/staff profile (null if signed out). */
export async function getAuthProfile(): Promise<AuthProfile | null> {
  // Request-time only: session cookies / Supabase client may touch Date.now().
  await connection();
  if (!authConfigured) return null;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ensured } = await supabase.rpc("ensure_auth_profiles");
  const row = ensured as { email?: string; is_staff?: boolean; role?: AuthProfile["role"] } | null;

  const { data: customer } = await supabase
    .from("customer_profiles")
    .select("email, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  let role = row?.role ?? null;
  let isStaff = Boolean(row?.is_staff);
  if (!isStaff) {
    const { data: staff } = await supabase
      .from("staff_profiles")
      .select("role, is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    if (staff?.is_active) {
      isStaff = true;
      role = staff.role as AuthProfile["role"];
    }
  }

  return {
    userId: user.id,
    email: customer?.email ?? row?.email ?? user.email ?? null,
    displayName: customer?.display_name ?? user.user_metadata?.full_name ?? null,
    isStaff,
    role,
  };
}
