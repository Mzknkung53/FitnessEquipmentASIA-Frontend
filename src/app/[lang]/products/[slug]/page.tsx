import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon, PlayIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery, ProductPurchase } from "@/app/[lang]/products/[slug]/product-client";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { categoryName } from "@/lib/i18n/names";

// Cache Components requires at least one param at build time. With an empty catalog
// (new project, or Supabase not configured) use a slug the database can never hold
// (its check only allows a-z, 0-9 and "-"); it renders the 404 page.
const NO_PRODUCTS_SLUG = "_";

export async function generateStaticParams() {
  const products = await getProducts();
  if (products.length === 0) return [{ slug: NO_PRODUCTS_SLUG }];
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, t } = await langFrom(params);
  const product = await getProduct((await params).slug);
  if (!product) return { title: t.meta.productNotFound };
  return { title: lang === "th" ? `${product.nameEn} · ${product.nameTh}` : product.nameEn };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[slug]">) {
  const { lang, t } = await langFrom(params);
  const pt = t.product;
  const to = (path: string) => localePath(lang, path);
  const { slug } = await params;
  const [product, products, categories] = await Promise.all([getProduct(slug), getProducts(), getCategories()]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category);
  const related = products.filter((p) => p.slug !== product.slug && (p.category === product.category || p.image)).slice(0, 4);
  const visibleSpecs = product.specs.filter((s) => s.value.trim() !== "");

  return (
    <>
      <div className="wrap flex flex-col gap-5 pt-6 pb-[72px]">
        <nav aria-label={t.common.breadcrumb} className="text-sm text-muted">
          <Link href={to("/")} className="underline">{t.common.home}</Link> / <Link href={to(`/products?cat=${product.category}`)} className="underline">{category && categoryName(category, lang, t)}</Link> / {product.nameEn}
        </nav>
        <div className="grid items-start gap-14 lg:grid-cols-[1.2fr_1fr]">
          <ProductGallery product={product} />
          <Suspense fallback={<div className="min-h-[600px]" />}>
            <ProductPurchase product={product} />
          </Suspense>
        </div>
      </div>

      <nav aria-label={pt.onThisPage} className="sticky top-[84px] z-20 border-y border-line bg-white">
        <div className="wrap flex gap-9 overflow-x-auto">
          {visibleSpecs.length > 0 && <a href="#spec" className="inline-flex min-h-14 items-center border-b-[3px] border-brand font-semibold">{pt.specs}</a>}
          {product.usageSteps.length > 0 && <a href="#use" className="inline-flex min-h-14 items-center border-b-[3px] border-transparent font-semibold text-muted hover:text-ink">{pt.howToUse}</a>}
          <a href="#related" className="inline-flex min-h-14 items-center border-b-[3px] border-transparent font-semibold text-muted hover:text-ink">{pt.pairsWith}</a>
        </div>
      </nav>

      {visibleSpecs.length > 0 && (
        <section id="spec" className="scroll-mt-40 bg-night text-white">
          <div className="wrap grid items-center gap-16 py-24 lg:grid-cols-2">
            <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[18px] bg-stage">
              {product.image && <Image src={product.image.src} alt="" width={product.image.width} height={product.image.height} sizes="(min-width: 1024px) 600px, 100vw" className="blend-stage h-[92%] w-[80%] object-contain" />}
            </div>
            <div className="flex flex-col gap-7">
              <span className="eyebrow text-brand">Specifications</span>
              <h2 className="font-display text-[44px] leading-[1.1] font-bold">{pt.specsTitle}</h2>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-night-line bg-night-line">
                {visibleSpecs.map((s) => (
                  <div key={s.label} className="flex flex-col bg-night p-[22px]">
                    <dt className="text-[13px] text-muted-night">{s.label}</dt>
                    <dd className="font-display text-[22px] font-semibold sm:text-[26px]">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <span className="text-sm text-muted-night">{pt.specsNote}</span>
              <span className="inline-flex min-h-[52px] w-fit items-center gap-2 rounded-lg bg-white px-5 font-semibold text-ink">
                <Icon name="quote" /> {pt.manual}
              </span>
            </div>
          </div>
        </section>
      )}

      {product.usageSteps.length > 0 && (
        <section id="use" className="wrap scroll-mt-40 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[18px] bg-stage">
              {product.image && <Image src={product.image.src} alt="" width={product.image.width} height={product.image.height} sizes="(min-width: 1024px) 600px, 100vw" className="blend-stage h-[90%] w-[60%] object-contain" />}
              <span className="absolute inset-0 bg-night/40" />
              <span className="absolute grid size-[84px] place-items-center rounded-full bg-brand text-white">
                <PlayIcon size={30} />
              </span>
              <span className="absolute bottom-3.5 left-3.5 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold">{t.common.sampleVideo}</span>
            </div>
            <div className="flex flex-col gap-5">
              <span className="eyebrow text-brand">How to use</span>
              <h2 className="font-display text-[44px] leading-[1.1] font-bold">{pt.howToUse}</h2>
              <ol className="flex flex-col border-b border-line">
                {product.usageSteps.map((s, i) => (
                  <li key={s} className="flex gap-[18px] border-t border-line py-4">
                    <span className="w-9 font-display text-[22px] font-bold text-brand">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <section id="related" className="wrap flex scroll-mt-40 flex-col gap-7 pt-6 pb-[104px]">
        <h2 className="font-display text-4xl font-bold">{pt.pairsTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
