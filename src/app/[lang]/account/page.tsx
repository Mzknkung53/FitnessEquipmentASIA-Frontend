import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthProfile } from "@/lib/auth";
import { langFrom } from "@/lib/i18n";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/th";

export async function generateMetadata({ params }: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.account };
}

export default async function AccountPage({ params }: PageProps<"/[lang]/account">) {
  const { lang, t } = await langFrom(params);
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">{t.account.loading}</div>}>
      <AccountContent lang={lang} t={t} />
    </Suspense>
  );
}

async function AccountContent({ lang, t }: { lang: Locale; t: Dictionary }) {
  const to = (path: string) => localePath(lang, path);
  const profile = await getAuthProfile();
  if (!profile) redirect(`${to("/login")}?next=${encodeURIComponent(to("/account"))}`);
  const a = t.account;

  return (
    <section className="bg-stage">
      <div className="wrap flex max-w-[640px] flex-col gap-8 py-20">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-brand">{a.eyebrow}</p>
          <h1 className="font-display text-[clamp(36px,5vw,48px)] leading-[1.1] font-bold text-ink">{a.title}</h1>
          <p className="text-muted">{a.intro}</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <dl className="grid gap-4 text-[15px]">
            <div>
              <dt className="text-muted">{a.name}</dt>
              <dd className="mt-1 font-semibold text-ink">{profile.displayName || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{a.email}</dt>
              <dd className="mt-1 font-semibold break-all text-ink">{profile.email || "—"}</dd>
            </div>
            {profile.isStaff && (
              <div>
                <dt className="text-muted">{a.staffRole}</dt>
                <dd className="mt-1 font-semibold text-ink">{profile.role}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={to("/quote")} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
              {a.requestQuote}
            </Link>
            {profile.isStaff && (
              <Link href="/staff" className="inline-flex min-h-11 items-center rounded-lg border border-control px-5 font-semibold text-ink hover:bg-stage">
                {a.staffArea}
              </Link>
            )}
            <SignOutButton
              label={t.common.signOut}
              busyLabel={t.common.signingOut}
              home={to("/")}
              className="inline-flex min-h-11 items-center rounded-lg px-4 font-semibold text-muted hover:text-ink"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
