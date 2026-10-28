// Uploads public/images/products/* to the Supabase Storage bucket "product-media"
// under products/, matching the paths in the backend seed (product_media.storage_path).
//
//   node --env-file=.env.local scripts/upload-product-images.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. in .env.local).");
  process.exit(1);
}

const types = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
const dir = path.join(import.meta.dirname, "..", "public", "images", "products");
const supabase = createClient(url, key, { auth: { persistSession: false } });

let failed = 0;
for (const name of await readdir(dir)) {
  const type = types[path.extname(name).toLowerCase()];
  if (!type) continue;
  const { error } = await supabase.storage
    .from("product-media")
    .upload(`products/${name}`, await readFile(path.join(dir, name)), { contentType: type, upsert: true });
  console.log(error ? `failed   ${name}: ${error.message}` : `uploaded products/${name}`);
  if (error) failed++;
}
process.exit(failed ? 1 : 0);
