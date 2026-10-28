import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase access. Nothing here reaches the browser: the secret key
// bypasses Row Level Security and may only be used to call the database's
// submit_* functions (see the backend repo's supabase/migrations).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

/** false until .env.local is filled in; the catalog then falls back to sample data. */
export const supabaseConfigured = Boolean(url && publishableKey && secretKey);

const options = { auth: { persistSession: false, autoRefreshToken: false } };
let catalog: SupabaseClient | null = null;
let service: SupabaseClient | null = null;

/** Publishable key: reads what RLS allows anyone to read (the published catalog). */
export function catalogClient(): SupabaseClient {
  if (!url || !publishableKey) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)");
  return (catalog ??= createClient(url, publishableKey, options));
}

/** Secret key: for the quote / service form functions and private file uploads only. */
export function serviceClient(): SupabaseClient {
  if (!url || !secretKey) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)");
  return (service ??= createClient(url, secretKey, options));
}

/** Public URL of a file in the product-media bucket. */
export function productMediaUrl(path: string): string {
  return `${url}/storage/v1/object/public/product-media/${path.split("/").map(encodeURIComponent).join("/")}`;
}
