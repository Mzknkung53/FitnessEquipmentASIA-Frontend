"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { contactChannels } from "@/lib/site";

export function SiteFooter() {
  const { t, href } = useI18n();
  const f = t.footer;
  return (
    <footer className="border-t-4 border-brand bg-night text-white">
      <div className="wrap grid gap-10 pt-16 pb-12 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Image src="/brand/fea-logo.png" alt="Fitness Equipment Asia" width={818} height={229} className="h-auto w-[200px]" />
          <p className="text-muted-night">{f.tagline}</p>
        </div>
        <FooterCol title={f.products} links={[[href("/products"), f.allProducts], [href("/products?cat=plate-loaded"), f.plateLoaded], [href("/products?cat=cardio"), f.cardio], [href("/products?cat=racks"), f.racks]]} />
        <FooterCol title={f.services} links={[[href("/quote"), f.gymSetup], [href("/showroom#warranty"), f.warranty], [href("/showroom#service"), f.repair], [href("/showroom#faq"), f.delivery]]} />
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[17px] font-semibold">{f.contact}</span>
          {contactChannels.map((c) =>
            c.href ? (
              <a key={c.id} href={c.href} className="text-muted-night hover:text-white">
                {t.contact.channels[c.id]} · {c.handle}
              </a>
            ) : (
              <span key={c.id} className="text-muted-night">
                {t.contact.channels[c.id]} · {c.handle}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-[#23201d] pt-5 pb-7 text-[13px] text-muted-night">
        <span>© Fitness Equipment Asia</span>
        <span className="flex gap-4">
          <Link href={href("/showroom#faq")} className="hover:text-white">{f.privacy}</Link>
          <Link href={href("/showroom#faq")} className="hover:text-white">{f.terms}</Link>
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-display text-[17px] font-semibold">{title}</span>
      {links.map(([href, label]) => (
        <Link key={label} href={href} className="text-muted-night hover:text-white">
          {label}
        </Link>
      ))}
    </div>
  );
}
