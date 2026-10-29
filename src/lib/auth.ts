import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { authConfigured } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthProfile = {
  userId: string;
  email: string | null;
  displayName: string | null;
  isStaff: boolean;
  role: "admin" | "sales" | "warehouse" | "service" | null;
};

/**
 * Current session + customer/staff profile (null if signed out).
 *
 * Read-only: profiles are created/synced once per sign-in in /auth/callback
 * (ensure_auth_profiles), not on every page view. cache() makes the header and
 * the page share one lookup per request.
 */
export const getAuthProfile = cache(async (): Promise<AuthProfile | null> => {
  // Request-time only: session cookies / Supabase client may touch Date.now().
  await connection();
  if (!authConfigured) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const [{ data: customer }, { data: staff }] = await Promise.all([
    supabase.from("customer_profiles").select("email, display_name").eq("user_id", claims.sub).maybeSingle(),
    supabase.from("staff_profiles").select("role, is_active").eq("user_id", claims.sub).maybeSingle(),
  ]);

  const isStaff = Boolean(staff?.is_active);
  const metadata = (claims.user_metadata ?? {}) as { full_name?: string; name?: string };
  return {
    userId: claims.sub,
    email: customer?.email ?? (typeof claims.email === "string" ? claims.email : null),
    displayName: customer?.display_name ?? metadata.full_name ?? metadata.name ?? null,
    isStaff,
    role: isStaff ? (staff!.role as AuthProfile["role"]) : null,
  };
});

/** Quotes are handled by sales (admin passes every role check in the database too). */
export function canHandleQuotes(profile: AuthProfile) {
  return profile.isStaff && (profile.role === "admin" || profile.role === "sales");
}
