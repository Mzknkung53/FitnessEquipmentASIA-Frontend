import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getAuthProfile } from "@/lib/auth";
import { langFrom } from "@/lib/i18n";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/th";
import { authConfigured } from "@/lib/supabase/env";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.login };
}

export default async function CustomerLoginPage({ params, searchParams }: PageProps<"/[lang]/login">) {
  const { lang, t } = await langFrom(params);
  return (
    <Suspense fallback={<LoginShell t={t} />}>
      <CustomerLogin lang={lang} t={t} searchParams={searchParams as Promise<{ error?: string; next?: string }>} />
    </Suspense>
  );
}

async function CustomerLogin({ lang, t, searchParams }: { lang: Locale; t: Dictionary; searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const profile = await getAuthProfile();
  const next = params.next?.startsWith("/") ? params.next : localePath(lang, "/account");
  if (profile) redirect(next);

  return (
    <LoginShell t={t}>
      {!authConfigured ? (
        <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted">{t.login.notConfigured}</p>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_12px_40px_rgba(22,19,15,0.06)]">
          <GoogleSignInButton next={next} label={t.login.button} busyLabel={t.login.opening} errorLabel={t.login.error} />
          {params.error && <p className="mt-4 text-sm text-brand">{t.login.failed}</p>}
          <p className="mt-5 text-sm text-muted">
            {t.login.staffHint}{" "}
            <Link href="/staff/login" className="font-semibold text-ink underline-offset-2 hover:underline">
              /staff/login
            </Link>
          </p>
        </div>
      )}
    </LoginShell>
  );
}

function LoginShell({ t, children }: { t: Dictionary; children?: React.ReactNode }) {
  return (
    <section className="bg-stage">
      <div className="wrap flex max-w-[560px] flex-col gap-8 py-20">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-brand">{t.login.eyebrow}</p>
          <h1 className="font-display text-[clamp(36px,5vw,52px)] leading-[1.1] font-bold tracking-[-0.02em] text-ink">{t.login.title}</h1>
          <p className="text-[17px] text-muted">{t.login.intro}</p>
        </div>
        {children ?? <p className="text-muted">{t.common.loading}</p>}
      </div>
    </section>
  );
}
