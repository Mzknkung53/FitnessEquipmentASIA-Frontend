import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.rpc("ensure_auth_profiles");
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/account"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
