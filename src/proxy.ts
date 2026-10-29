import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE } from "@/lib/i18n/config";

// Areas outside the storefront languages (they have no /en or /zh version).
const UNLOCALIZED = /^\/(staff|auth|api|_)(\/|$)/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Thai is the default language and is served without a prefix: /th/... is sent
  // back to the plain address, and plain addresses are served from the /th pages.
  if (pathname === "/th" || pathname.startsWith("/th/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(target, 308);
  }
  let rewriteTo: URL | null = null;
  let lang: string | null = null;
  if (!UNLOCALIZED.test(pathname)) {
    lang = pathname.match(/^\/(en|zh)(?=\/|$)/)?.[1] ?? "th";
    if (lang === "th") {
      rewriteTo = request.nextUrl.clone();
      rewriteTo.pathname = pathname === "/" ? "/th" : `/th${pathname}`;
    }
  }
  const pass = () => (rewriteTo ? NextResponse.rewrite(rewriteTo, { request }) : NextResponse.next({ request }));
  // Remember the storefront language so the staff area (no language in its URLs) can follow it.
  // Prefetches (e.g. of the language links in the header) are not visits, so they don't count.
  const prefetch = request.headers.has("next-router-prefetch") || /prefetch/i.test(request.headers.get("sec-purpose") ?? request.headers.get("purpose") ?? "");
  const remember = (res: NextResponse) => {
    if (lang && !prefetch && request.cookies.get(LANG_COOKIE)?.value !== lang) {
      res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  };

  let response = pass();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return remember(response);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = pass();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refresh the session cookie so Server Components see an up-to-date user.
  // getClaims verifies the JWT locally when the project uses asymmetric signing keys.
  await supabase.auth.getClaims();
  return remember(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|pdf)$).*)"],
};
