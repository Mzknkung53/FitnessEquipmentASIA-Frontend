import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactLauncher } from "@/components/contact-launcher";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthProfile } from "@/lib/auth";
import { htmlLang, locales } from "@/lib/i18n/config";
import { langFrom } from "@/lib/i18n";

// Storefront in every language: /… (Thai), /en/…, /zh/…. Any other first segment
// is a 404 (langFrom calls notFound()).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return {
    title: { default: t.meta.title, template: "%s · Fitness Equipment Asia" },
    description: t.meta.description,
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang, t } = await langFrom(params);
  return (
    <I18nProvider lang={lang} t={t}>
      <div lang={htmlLang[lang]} className="contents">
        <Suspense fallback={<SiteHeader accountEmail={null} />}>
          <AuthedHeader />
        </Suspense>
        <main className="page-enter">{children}</main>
        <SiteFooter />
        <ContactLauncher />
      </div>
    </I18nProvider>
  );
}

async function AuthedHeader() {
  const profile = await getAuthProfile();
  return <SiteHeader accountEmail={profile?.email ?? null} />;
}
