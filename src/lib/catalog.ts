import { cacheLife } from "next/cache";
import { catalogClient, productMediaUrl, supabaseConfigured } from "@/lib/supabase";
import type { Category, CategoryId, PictogramKind, Product, StockStatus } from "@/lib/types";

// Catalog repository. Pages only talk to these functions. Reads products_public
// when Supabase is configured; otherwise returns empty lists.

/** Row of the products_public view (backend repo, supabase/migrations/*_api.sql). */
type ProductRow = {
  slug: string;
  model: string;
  name_th: string;
  name_en: string;
  category_id: string;
  summary: string | null;
  setting: Array<"home" | "commercial">;
  is_new: boolean;
  curated_rank: number | null;
  pictogram: string | null;
  unit_note: string | null;
  specs: { label: string; value: string }[];
  usage_steps: string[];
  is_demo: boolean;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  image_alt: string | null;
  variants: { sku: string; label: string; swatch: string | null; status: StockStatus; price_thb: number | null; lead_time: string | null }[];
};

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    model: row.model,
    nameEn: row.name_en,
    nameTh: row.name_th,
    category: row.category_id as CategoryId,
    summary: row.summary ?? "",
    setting: row.setting,
    isNew: row.is_new,
    curatedRank: row.curated_rank ?? Number.MAX_SAFE_INTEGER,
    image:
      row.image_path && row.image_width && row.image_height
        ? { src: productMediaUrl(row.image_path), width: row.image_width, height: row.image_height, alt: row.image_alt ?? row.name_th }
        : undefined,
    pictogram: (row.pictogram ?? undefined) as PictogramKind | undefined,
    variants: row.variants.map((v) => ({
      sku: v.sku,
      label: v.label,
      swatch: v.swatch ?? "#8f8d89",
      status: v.status,
      priceThb: v.price_thb,
      leadTime: v.lead_time ?? undefined,
    })),
    specs: row.specs,
    usageSteps: row.usage_steps,
    unitNote: row.unit_note ?? undefined,
    demo: row.is_demo,
  };
}

async function fetchProducts(): Promise<Product[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await catalogClient()
    .from("products_public")
    .select("*")
    .order("curated_rank", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Loading products failed: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return fetchProducts();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("hours");
  if (!supabaseConfigured) return undefined;
  const { data, error } = await catalogClient().from("products_public").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Loading product ${slug} failed: ${error.message}`);
  return data ? toProduct(data as ProductRow) : undefined;
}

export async function getNewArrivals(limit = 3): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return (await fetchProducts()).filter((p) => p.isNew).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  if (!supabaseConfigured) return [];
  const { data, error } = await catalogClient().from("categories").select("id, name_th, name_en").order("sort");
  if (error) throw new Error(`Loading categories failed: ${error.message}`);
  return data.map((c) => ({ id: c.id as CategoryId, nameTh: c.name_th, nameEn: c.name_en }));
}
