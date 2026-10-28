"use server";

import { revalidatePath } from "next/cache";
import { getAuthProfile } from "@/lib/auth";
import { categoryPrefix, formatProductCode, maxSequence } from "@/lib/product-codes";
import { createServerSupabase } from "@/lib/supabase/server";

export type StaffActionResult = { ok: true; slug: string } | { ok: false; error: string };

const categoryRe = /^[a-z0-9-]+$/;
const imageTypes = new Set(["image/webp", "image/jpeg", "image/png"]);
const maxImageBytes = 10 * 1024 * 1024;

const angleSlots = [
  { key: "image_front", label: "มุมหน้า", sort: 0, required: true },
  { key: "image_side", label: "มุมข้าง", sort: 1, required: false },
  { key: "image_back", label: "มุมหลัง", sort: 2, required: false },
  { key: "image_detail", label: "รายละเอียด / มุมอื่น", sort: 3, required: false },
] as const;

function text(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function fileOne(form: FormData, key: string) {
  const v = form.get(key);
  return v instanceof File && v.size > 0 && v.name !== "" ? v : null;
}

function extFor(type: string) {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  return "jpg";
}

function normalizeVideoUrl(raw: string) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Next sequential code for a category, e.g. plaload-0001 */
export async function getNextProductCode(categoryId: string): Promise<{ ok: true; code: string; prefix: string } | { ok: false; error: string }> {
  const profile = await getAuthProfile();
  if (!profile?.isStaff) return { ok: false, error: "ต้องเข้าสู่ระบบพนักงานก่อน" };
  const id = categoryId.toLowerCase().trim();
  if (!categoryRe.test(id)) return { ok: false, error: "หมวดไม่ถูกต้อง" };

  const prefix = categoryPrefix(id);
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("products").select("slug, model").ilike("slug", `${prefix}-%`);
  if (error) return { ok: false, error: error.message };

  const codes = (data ?? []).flatMap((row) => [row.slug, row.model].filter(Boolean) as string[]);
  const next = maxSequence(codes, prefix) + 1;
  return { ok: true, code: formatProductCode(prefix, next), prefix };
}

/** Creates category + product + variant + angled media. Codes are assigned sequentially. */
export async function createStaffProduct(form: FormData): Promise<StaffActionResult> {
  const profile = await getAuthProfile();
  if (!profile?.isStaff) return { ok: false, error: "ต้องเข้าสู่ระบบพนักงานก่อน" };

  const categoryId = text(form, "category_id").toLowerCase();
  const categoryNameTh = text(form, "category_name_th");
  const categoryNameEn = text(form, "category_name_en");
  const nameTh = text(form, "name_th");
  const nameEn = text(form, "name_en");
  const summary = text(form, "summary") || null;
  const variantLabel = text(form, "variant_label") || "มาตรฐาน";
  const priceRaw = text(form, "price_thb");
  const stockStatus = text(form, "stock_status") || "import";
  const status = text(form, "status") || "published";
  const settingHome = form.has("setting_home");
  const settingCommercial = form.has("setting_commercial");
  const videoUrlRaw = text(form, "video_url");
  const videoUrl = normalizeVideoUrl(videoUrlRaw);
  if (videoUrlRaw && !videoUrl) return { ok: false, error: "ลิงก์วิดีโอไม่ถูกต้อง (ใช้ https://...)" };

  if (!categoryRe.test(categoryId)) return { ok: false, error: "รหัสหมวดต้องเป็น a-z, 0-9, ขีด (-)" };
  if (!categoryNameTh || !categoryNameEn) return { ok: false, error: "กรอกชื่อหมวดภาษาไทยและอังกฤษ" };
  if (!nameTh || !nameEn) return { ok: false, error: "กรอกชื่อสินค้าให้ครบ" };
  if (!["ready", "preorder", "import", "out"].includes(stockStatus)) return { ok: false, error: "สถานะสต็อกไม่ถูกต้อง" };
  if (!["draft", "published", "archived"].includes(status)) return { ok: false, error: "สถานะสินค้าไม่ถูกต้อง" };

  const front = fileOne(form, "image_front");
  if (!front) return { ok: false, error: "ต้องมีรูปมุมหน้า" };

  const angled = angleSlots
    .map((slot) => ({ slot, file: fileOne(form, slot.key) }))
    .filter((row): row is { slot: (typeof angleSlots)[number]; file: File } => Boolean(row.file));

  for (const { slot, file } of angled) {
    if (!imageTypes.has(file.type)) return { ok: false, error: `รองรับเฉพาะ JPG / PNG / WebP (${slot.label})` };
    if (file.size > maxImageBytes) return { ok: false, error: `แต่ละรูปไม่เกิน 10 MB (${slot.label})` };
  }

  let imageMeta: Record<string, { width: number; height: number }> = {};
  try {
    const parsed: unknown = JSON.parse(text(form, "image_meta") || "{}");
    if (parsed && typeof parsed === "object") imageMeta = parsed as Record<string, { width: number; height: number }>;
  } catch {
    return { ok: false, error: "ข้อมูลขนาดรูปไม่ถูกต้อง ลองเลือกรูปใหม่" };
  }

  let priceThb: number | null = null;
  if (priceRaw !== "") {
    priceThb = Number(priceRaw);
    if (!Number.isFinite(priceThb) || priceThb <= 0) return { ok: false, error: "ราคาต้องมากกว่า 0 หรือเว้นว่างถ้าให้สอบถามราคา" };
  }

  const setting: Array<"home" | "commercial"> = [];
  if (settingHome) setting.push("home");
  if (settingCommercial) setting.push("commercial");
  if (setting.length === 0) setting.push("commercial");

  const next = await getNextProductCode(categoryId);
  if (!next.ok) return next;
  const slug = next.code;
  const model = next.code.toUpperCase();
  const sku = `${next.code.toUpperCase()}-STD`;

  const supabase = await createServerSupabase();

  // Create the category only if it is new; an existing one keeps its names and order.
  const { data: existingCategory } = await supabase.from("categories").select("id").eq("id", categoryId).maybeSingle();
  if (!existingCategory) {
    const { data: last } = await supabase.from("categories").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
    const { error: catError } = await supabase.from("categories").upsert(
      { id: categoryId, name_th: categoryNameTh, name_en: categoryNameEn, sort: (last?.sort ?? 0) + 10 },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (catError) return { ok: false, error: `หมวดหมู่: ${catError.message}` };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      slug,
      model,
      name_th: nameTh,
      name_en: nameEn,
      category_id: categoryId,
      summary,
      setting,
      status,
      is_demo: false,
      arrived_at: new Date().toISOString().slice(0, 10),
      specs: [],
      usage_steps: [],
    })
    .select("id")
    .single();
  if (productError) return { ok: false, error: `สินค้า: ${productError.message}` };

  const { error: variantError } = await supabase.from("variants").insert({
    sku,
    product_id: product.id,
    label: variantLabel,
    swatch: "#1b1a18",
    stock_status: stockStatus,
    price_thb: priceThb,
    sort: 0,
    is_active: true,
  });
  if (variantError) {
    await supabase.from("products").delete().eq("id", product.id);
    return { ok: false, error: `รุ่นย่อย: ${variantError.message}` };
  }

  // Undo a half-saved product: the row (variants/media cascade) and any uploaded photos.
  const uploaded: string[] = [];
  const rollback = async () => {
    if (uploaded.length > 0) await supabase.storage.from("product-media").remove(uploaded);
    await supabase.from("products").delete().eq("id", product.id);
  };

  const mediaRows: {
    product_id: string;
    kind: "image" | "video";
    storage_path?: string;
    external_url?: string;
    width?: number;
    height?: number;
    alt?: string;
    sort: number;
  }[] = [];

  for (const { slot, file } of angled) {
    const meta = imageMeta[slot.key];
    const width = meta?.width && meta.width > 0 ? Math.round(meta.width) : 1200;
    const height = meta?.height && meta.height > 0 ? Math.round(meta.height) : 1200;
    const alt = `${nameTh} · ${slot.label}`;
    const path = `products/${slug}/${slot.key.replace("image_", "")}.${extFor(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from("product-media").upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      await rollback();
      return { ok: false, error: `อัปโหลด${slot.label}ไม่สำเร็จ: ${uploadError.message}` };
    }
    uploaded.push(path);
    mediaRows.push({
      product_id: product.id,
      kind: "image",
      storage_path: path,
      width,
      height,
      alt,
      sort: slot.sort,
    });
  }

  if (videoUrl) {
    mediaRows.push({
      product_id: product.id,
      kind: "video",
      external_url: videoUrl,
      sort: 90,
    });
  }

  if (mediaRows.length > 0) {
    const { error: mediaError } = await supabase.from("product_media").insert(mediaRows);
    if (mediaError) {
      await rollback();
      return { ok: false, error: `บันทึกสื่อไม่สำเร็จ: ${mediaError.message}` };
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/staff");
  return { ok: true, slug };
}
