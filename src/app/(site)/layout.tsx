import { ContactLauncher } from "@/components/contact-launcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthProfile();
  return (
    <>
      <SiteHeader accountEmail={profile?.email ?? null} />
      <main>{children}</main>
      <SiteFooter />
      <ContactLauncher />
    </>
  );
}
