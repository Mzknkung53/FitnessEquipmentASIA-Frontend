"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createStaffProduct, getNextProductCode } from "@/app/staff/actions";
import { categoryPrefix } from "@/lib/product-codes";
import type { Category } from "@/lib/types";

const input = "min-h-11 w-full rounded-lg border border-[#3d3934] bg-[#151311] px-3.5 text-[15px] text-white placeholder:text-muted-night";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold text-[#d8d3cc]";

const defaultCategories: { id: string; nameTh: string; nameEn: string }[] = [
  { id: "plate-loaded", nameTh: "เครื่องใส่แผ่นน้ำหนัก", nameEn: "Plate-Loaded" },
  { id: "cardio", nameTh: "คาร์ดิโอ", nameEn: "Cardio" },
  { id: "selectorized", nameTh: "เครื่องเวทแบบสถานี", nameEn: "Selectorized machines" },
  { id: "racks", nameTh: "แร็คและฟังก์ชันนอล", nameEn: "Racks & functional" },
  { id: "free-weights", nameTh: "ฟรีเวทและม้านั่ง", nameEn: "Free weights & benches" },
  { id: "accessories", nameTh: "อุปกรณ์เสริม", nameEn: "Accessories" },
  { id: "flooring", nameTh: "พื้นยางและชั้นวาง", nameEn: "Flooring & storage" },
];

const angleSlots = [
  { key: "image_front", label: "มุมหน้า", hint: "รูปหลักบนหน้าเว็บ", required: true },
  { key: "image_side", label: "มุมข้าง", hint: "ไม่บังคับ", required: false },
  { key: "image_back", label: "มุมหลัง", hint: "ไม่บังคับ", required: false },
  { key: "image_detail", label: "รายละเอียด", hint: "เช่น แผงควบคุม / เนื้อผ้า", required: false },
] as const;

type AngleKey = (typeof angleSlots)[number]["key"];

type AngleDraft = {
  file: File;
  preview: string;
  width: number;
  height: number;
};

export function StaffProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okSlug, setOkSlug] = useState<string | null>(null);
  const [nextCode, setNextCode] = useState<string>("…");
  const [angles, setAngles] = useState<Partial<Record<AngleKey, AngleDraft>>>({});
  const merged = mergeCategories(categories);
  const [categoryId, setCategoryId] = useState(merged[0]?.id ?? "plate-loaded");
  const selected = merged.find((c) => c.id === categoryId) ?? merged[0];

  useEffect(() => {
    let cancelled = false;
    setNextCode("…");
    void getNextProductCode(categoryId).then((res) => {
      if (cancelled) return;
      setNextCode(res.ok ? res.code : `${categoryPrefix(categoryId)}-????`);
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const setAngle = async (key: AngleKey, list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(`รองรับเฉพาะ JPG / PNG / WebP (${file.name})`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`แต่ละรูปไม่เกิน 10 MB (${file.name})`);
      return;
    }
    try {
      const dim = await readImageSize(file);
      setAngles((prev) => {
        const old = prev[key];
        if (old) URL.revokeObjectURL(old.preview);
        return {
          ...prev,
          [key]: { file, preview: URL.createObjectURL(file), width: dim.width, height: dim.height },
        };
      });
    } catch {
      setError(`อ่านไฟล์รูปไม่สำเร็จ (${file.name})`);
    }
  };

  const clearAngle = (key: AngleKey) => {
    setAngles((prev) => {
      const old = prev[key];
      if (old) URL.revokeObjectURL(old.preview);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!angles.image_front) {
      setError("ต้องมีรูปมุมหน้า");
      return;
    }
    const form = new FormData(e.currentTarget);
    const meta: Record<string, { width: number; height: number }> = {};
    for (const slot of angleSlots) {
      const draft = angles[slot.key];
      if (!draft) continue;
      form.set(slot.key, draft.file, draft.file.name);
      meta[slot.key] = { width: draft.width, height: draft.height };
    }
    form.set("image_meta", JSON.stringify(meta));
    setError(null);
    setOkSlug(null);
    start(async () => {
      const result = await createStaffProduct(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOkSlug(result.slug);
      Object.values(angles).forEach((img) => img && URL.revokeObjectURL(img.preview));
      setAngles({});
      e.currentTarget.reset();
      setCategoryId(merged[0]?.id ?? "plate-loaded");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#26231f] bg-night-2 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-semibold">เพิ่มสินค้า</h2>
        <p className="text-sm text-muted-night">รหัสรันอัตโนมัติตามหมวด · ใส่รูปแยกมุม · วิดีโอใส่ลิงก์ · ราคาไม่รวม VAT</p>
      </div>

      <fieldset className="grid gap-4 md:grid-cols-3">
        <legend className="pb-2 text-sm font-semibold text-white">หมวดหมู่</legend>
        <label className={labelCls}>
          เลือกหมวด
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
            {merged.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTh}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="category_id" value={selected?.id ?? categoryId} />
        <label className={labelCls}>
          ชื่อหมวด (ไทย)
          <input name="category_name_th" required defaultValue={selected?.nameTh} key={`${categoryId}-th`} className={input} />
        </label>
        <label className={labelCls}>
          ชื่อหมวด (EN)
          <input name="category_name_en" required defaultValue={selected?.nameEn} key={`${categoryId}-en`} className={input} />
        </label>
      </fieldset>

      <div className="rounded-xl border border-dashed border-[#3d3934] bg-[#151311] px-4 py-3 text-sm">
        <span className="text-muted-night">รหัสถัดไปของหมวดนี้ · </span>
        <span className="font-mono font-semibold text-white">{nextCode}</span>
        <span className="text-muted-night"> · SKU จะเป็น </span>
        <span className="font-mono text-white">{nextCode === "…" ? "…" : `${nextCode.toUpperCase()}-STD`}</span>
      </div>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="pb-2 text-sm font-semibold text-white">สินค้า</legend>
        <label className={labelCls}>
          ชื่อไทย
          <input name="name_th" required placeholder="ลู่วิ่งไฟฟ้าเชิงพาณิชย์" className={input} />
        </label>
        <label className={labelCls}>
          ชื่ออังกฤษ
          <input name="name_en" required placeholder="Commercial Treadmill" className={input} />
        </label>
        <label className={`${labelCls} md:col-span-2`}>
          คำอธิบายสั้น
          <input name="summary" placeholder="สรุปสั้นๆ แสดงบนหน้าสินค้า" className={input} />
        </label>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="setting_home" className="size-4 accent-brand" /> เหมาะกับบ้าน
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="setting_commercial" defaultChecked className="size-4 accent-brand" /> เหมาะกับยิม
          </label>
        </div>
        <label className={labelCls}>
          สถานะหน้าเว็บ
          <select name="status" defaultValue="published" className={input}>
            <option value="published">เผยแพร่</option>
            <option value="draft">แบบร่าง</option>
            <option value="archived">เก็บถาวร</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="pb-2 text-sm font-semibold text-white">รูปสินค้าตามมุม</legend>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {angleSlots.map((slot) => {
            const draft = angles[slot.key];
            return (
              <div key={slot.key} className="flex flex-col gap-2 rounded-xl border border-[#3d3934] bg-[#151311] p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-white">
                    {slot.label}
                    {slot.required ? " *" : ""}
                  </span>
                  <span className="text-[11px] text-muted-night">{slot.hint}</span>
                </div>
                {draft ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.preview} alt="" className="aspect-square w-full rounded-lg object-cover" />
                    <p className="text-xs text-muted-night">
                      {draft.width}×{draft.height}
                    </p>
                    <button type="button" onClick={() => clearAngle(slot.key)} className="rounded-lg border border-[#3d3934] px-2.5 py-1.5 text-xs text-[#ff8a8f]">
                      ลบรูปนี้
                    </button>
                  </>
                ) : (
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-[#3d3934] text-center text-xs text-muted-night hover:border-brand hover:text-white">
                    <span>
                      เลือกรูป
                      <br />
                      JPG / PNG / WebP
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        void setAngle(slot.key, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="pb-2 text-sm font-semibold text-white">วิดีโอ (ไม่บังคับ)</legend>
        <label className={labelCls}>
          ลิงก์ YouTube / Vimeo / วิดีโอออนไลน์
          <input name="video_url" type="url" placeholder="https://www.youtube.com/watch?v=..." className={input} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="pb-2 text-sm font-semibold text-white">รุ่นย่อยแรก</legend>
        <label className={labelCls}>
          ป้ายรุ่นย่อย
          <input name="variant_label" placeholder="ดำ" defaultValue="มาตรฐาน" className={input} />
        </label>
        <label className={labelCls}>
          ราคา (บาท, ไม่รวม VAT)
          <input name="price_thb" inputMode="decimal" placeholder="เว้นว่าง = สอบถามราคา" className={input} />
        </label>
        <label className={labelCls}>
          สถานะสต็อก
          <select name="stock_status" defaultValue="ready" className={input}>
            <option value="ready">พร้อมส่ง</option>
            <option value="preorder">พรีออเดอร์</option>
            <option value="import">สั่งผลิต/นำเข้า</option>
            <option value="out">สินค้าหมด</option>
          </select>
        </label>
      </fieldset>

      {error && <p className="rounded-lg bg-[#3a1416] px-4 py-3 text-sm text-[#ff8a8f]">{error}</p>}
      {okSlug && (
        <p className="rounded-lg bg-[#16261c] px-4 py-3 text-sm text-[#6cc28d]">
          บันทึกแล้วเป็น <span className="font-mono font-semibold">{okSlug}</span> ·{" "}
          <a href={`/products/${okSlug}`} className="font-semibold underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            ดูหน้าสินค้า
          </a>
        </p>
      )}

      <button type="submit" disabled={pending} className="min-h-12 self-start rounded-lg bg-brand px-6 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "กำลังบันทึก…" : "บันทึกสินค้า"}
      </button>
    </form>
  );
}

function mergeCategories(existing: Category[]) {
  const map = new Map<string, { id: string; nameTh: string; nameEn: string }>();
  for (const c of defaultCategories) map.set(c.id, c);
  for (const c of existing) {
    map.set(c.id, {
      id: c.id,
      nameTh: c.nameTh || map.get(c.id)?.nameTh || c.id,
      nameEn: c.nameEn || map.get(c.id)?.nameEn || c.id,
    });
  }
  return [...map.values()];
}

function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}
