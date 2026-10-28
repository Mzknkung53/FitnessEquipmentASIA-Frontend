import { cacheLife } from "next/cache";
import { categories, sampleProducts } from "@/lib/data/sample-products";
import type { Category, Product } from "@/lib/types";

// Catalog repository. Pages only talk to these functions, so swapping the
// sample data for Supabase means changing this file only, e.g.:
//
//   const { data } = await supabase
//     .from("products_public")        // view: published products, variants embedded as JSON
//     .select("*")
//     .order("curated_rank");
//
// Keep the return shapes identical to the types in src/lib/types.ts.

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return sampleProducts;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("hours");
  return sampleProducts.find((p) => p.slug === slug);
}

export async function getNewArrivals(limit = 3): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return sampleProducts.filter((p) => p.isNew).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  return categories;
}
