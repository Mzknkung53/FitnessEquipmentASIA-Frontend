"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createStaffProduct, getNextProductCode } from "@/app/staff/actions";
import { useStaffI18n } from "@/app/staff/staff-i18n";
import { Icon } from "@/components/icons";
import { fmt, localePath } from "@/lib/i18n/config";
import { categoryPrefix } from "@/lib/product-codes";
import type { Category } from "@/lib/types";

const input = "min-h-12 w-full rounded-lg border border-[#3d3934] bg-[#151311] px-3.5 text-[15px] text-white placeholder:text-muted-night";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold text-[#d8d3cc]";
const hintCls = "text-xs font-normal text-muted-night";

const defaultCategories: { id: string; nameTh: string; nameEn: string }[] = [
  { id: "plate-loaded", nameTh: "เครื่องใส่แผ่นน้ำหนัก", nameEn: "Plate-Loaded" },
  { id: "cardio", nameTh: "คาร์ดิโอ", nameEn: "Cardio" },
  { id: "selectorized", nameTh: "เครื่องเวทแบบสถานี", nameEn: "Selectorized machines" },
  { id: "racks", nameTh: "แร็คและฟังก์ชันนอล", nameEn: "Racks & functional" },
  { id: "free-weights", nameTh: "ฟรีเวทและม้านั่ง", nameEn: "Free weights & benches" },
  { id: "accessories", nameTh: "อุปกรณ์เสริม", nameEn: "Accessories" },
  { id: "flooring", nameTh: "พื้นยางและชั้นวาง", nameEn: "Flooring & storage" },
];

/** Photo slots in upload order; labels come from t.form.angles. */
const angleKeys = ["image_front", "image_side", "image_back", "image_detail"] as const;

type AngleKey = (typeof angleKeys)[number];

type AngleDraft = {
  file: File;
  preview: string;
  width: number;
  height: number;
};

export function StaffProductForm({ categories }: { categories: Category[] }) {
  const { lang, t } = useStaffI18n();
  const f = t.form;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ slug: string; name: string; published: boolean } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [angles, setAngles] = useState<Partial<Record<AngleKey, AngleDraft>>>({});
  const [preparing, setPreparing] = useState<Partial<Record<AngleKey, boolean>>>({});
  const merged = mergeCategories(categories);
  const [categoryId, setCategoryId] = useState(merged[0]?.id ?? "plate-loaded");
  const selected = merged.find((c) => c.id === categoryId) ?? merged[0];
  const nextCode = codes[categoryId] ?? "…";
  const busyPhotos = Object.values(preparing).some(Boolean);

  useEffect(() => {
    let cancelled = false;
    void getNextProductCode(categoryId).then((res) => {
      if (cancelled) return;
      setCodes((prev) => ({ ...prev, [categoryId]: res.ok ? res.code : `${categoryPrefix(categoryId)}-????` }));
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, formKey]);

  const setAngle = async (key: AngleKey, list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(fmt(f.fileType, { file: file.name }));
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setError(fmt(f.fileTooBig, { file: file.name }));
      return;
    }
    setPreparing((prev) => ({ ...prev, [key]: true }));
    try {
      const shrunk = await shrinkImage(file);
      if (shrunk.file.size > 10 * 1024 * 1024) {
        setError(fmt(f.stillTooBig, { file: file.name }));
        return;
      }
      setAngles((prev) => {
        const old = prev[key];
        if (old) URL.revokeObjectURL(old.preview);
        return {
          ...prev,
          [key]: { file: shrunk.file, preview: URL.createObjectURL(shrunk.file), width: shrunk.width, height: shrunk.height },
        };
      });
    } catch {
      setError(fmt(f.readFailed, { file: file.name }));
    } finally {
      setPreparing((prev) => ({ ...prev, [key]: false }));
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

  const startOver = () => {
    Object.values(angles).forEach((img) => img && URL.revokeObjectURL(img.preview));
    setAngles({});
    setSaved(null);
    setError(null);
    setCodes({});
    setFormKey((k) => k + 1);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busyPhotos) return;
    if (!angles.image_front) {
      setError(f.needFront);
      return;
    }
    const form = new FormData(e.currentTarget);
    const meta: Record<string, { width: number; height: number }> = {};
    for (const key of angleKeys) {
      const draft = angles[key];
      if (!draft) continue;
      form.set(key, draft.file, draft.file.name);
      meta[key] = { width: draft.width, height: draft.height };
    }
    form.set("image_meta", JSON.stringify(meta));
    const name = String(form.get("name_th") ?? "");
    const published = form.get("status") === "published";
    setError(null);
    start(async () => {
      const result = await createStaffProduct(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved({ slug: result.slug, name, published });
    });
  };

  if (saved) {
    return (
      <div role="status" className="flash-in flex flex-col gap-4 rounded-2xl border border-[#1f3a28] bg-[#101c14] p-6">
        <span className="flex items-center gap-2 font-display text-2xl font-bold text-[#6cc28d]">
          <Icon name="check" /> {f.saved}
        </span>
        <p>
          {fmt(f.savedCode, { name: saved.name, code: saved.slug.toUpperCase() })}
          {saved.published ? f.savedPublished : f.savedDraft}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={startOver} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
            <Icon name="plus" size={16} /> {f.addAnother}
          </button>
          {saved.published && (
            <a href={localePath(lang, `/products/${saved.slug}`)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-[#3d3934] px-5 font-semibold hover:border-white">
              {f.viewProduct}
            </a>
          )}
          <Link href="/staff" className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-muted-night hover:text-white">
            {f.backToList}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="flex flex-col gap-6">
      <Step n={1} title={f.step1}>
        <label className={labelCls}>
          {f.category}
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
            {merged.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "th" ? c.nameTh : lang === "en" ? c.nameEn : (t.categories[c.id] ?? c.nameEn)}
              </option>
            ))}
          </select>
          <span className={hintCls}>
            {f.nextCode} <span className="font-mono text-white">{nextCode.toUpperCase()}</span> {f.autoCode}
          </span>
        </label>
        <input type="hidden" name="category_id" value={selected?.id ?? categoryId} />
        <input type="hidden" name="category_name_th" value={selected?.nameTh ?? categoryId} />
        <input type="hidden" name="category_name_en" value={selected?.nameEn ?? categoryId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            {f.nameTh}
            <input name="name_th" required maxLength={160} placeholder={f.nameThExample} className={input} />
          </label>
          <label className={labelCls}>
            {f.nameEn}
            <input name="name_en" required maxLength={160} placeholder="e.g. Commercial Treadmill" className={input} />
          </label>
        </div>
        <label className={labelCls}>
          {f.summary}
          <textarea name="summary" rows={2} maxLength={500} placeholder={f.summaryPlaceholder} className={`${input} py-3`} />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1.5 text-sm font-semibold text-[#d8d3cc]">{f.suitable}</legend>
          <div className="flex flex-wrap gap-2">
            <Chip name="setting_commercial" label={f.gym} defaultChecked />
            <Chip name="setting_home" label={f.home} />
          </div>
        </fieldset>
      </Step>

      <Step n={2} title={f.step2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            {f.price}
            <input name="price_thb" inputMode="decimal" placeholder={f.priceExample} className={input} />
            <span className={hintCls}>{f.priceHint}</span>
          </label>
          <label className={labelCls}>
            {f.stockStatus}
            <select name="stock_status" defaultValue="ready" className={input}>
              <option value="ready">{f.stock.ready}</option>
              <option value="preorder">{f.stock.preorder}</option>
              <option value="import">{f.stock.import}</option>
              <option value="out">{f.stock.out}</option>
            </select>
          </label>
        </div>
        <details className="group text-sm">
          <summary className="cursor-pointer text-muted-night hover:text-white">{f.more}</summary>
          <label className={`${labelCls} mt-3`}>
            {f.variant}
            <input name="variant_label" defaultValue={f.variantDefault} maxLength={80} className={input} />
            <span className={hintCls}>{f.variantHint}</span>
          </label>
        </details>
      </Step>

      <Step n={3} title={f.step3}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {angleKeys.map((key) => {
            const slot = f.angles[key];
            const draft = angles[key];
            const busy = preparing[key];
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#d8d3cc]">{slot.label}</span>
                {draft ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.preview} alt="" className="aspect-square w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => clearAngle(key)}
                      aria-label={fmt(f.remove, { label: slot.label.replace(" *", "") })}
                      className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-[#3d3934] p-2 text-center text-xs text-muted-night hover:border-brand hover:text-white">
                    <span className="flex flex-col items-center gap-1">
                      {busy ? (
                        f.shrinking
                      ) : (
                        <>
                          <Icon name="plus" size={18} />
                          {f.choose}
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label={fmt(f.chooseFor, { label: slot.label.replace(" *", "") })}
                      className="sr-only"
                      disabled={busy}
                      onChange={(e) => {
                        void setAngle(key, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                <span className={hintCls}>{slot.hint}</span>
              </div>
            );
          })}
        </div>
        <p className={hintCls}>{f.formats}</p>
        <label className={labelCls}>
          {f.video}
          <input name="video_url" type="url" placeholder="https://www.youtube.com/watch?v=..." className={input} />
          <span className={hintCls}>{f.videoHint}</span>
        </label>
      </Step>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#26231f] bg-night-2 p-5">
        <PublishToggle />
        {error && (
          <p role="alert" className="rounded-lg bg-[#3a1416] px-4 py-3 text-sm text-[#ff8a8f]">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending || busyPhotos} className="min-h-12 rounded-lg bg-brand px-6 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:self-start">
          {pending ? f.saving : busyPhotos ? f.preparing : f.save}
        </button>
      </div>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-[#26231f] bg-night-2 p-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold" aria-hidden="true">
        <span className="grid size-8 place-items-center rounded-full bg-brand text-sm">{n}</span>
        {title}
      </h2>
      {children}
    </fieldset>
  );
}

function Chip({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#3d3934] px-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-[#2a1214]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-brand" />
      {label}
    </label>
  );
}

function PublishToggle() {
  const { t } = useStaffI18n();
  const [on, setOn] = useState(true);
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="mt-1 size-5 accent-brand" />
      <input type="hidden" name="status" value={on ? "published" : "draft"} />
      <span className="flex flex-col">
        <span className="font-semibold">{t.form.publish}</span>
        <span className={hintCls}>{on ? t.form.publishOn : t.form.publishOff}</span>
      </span>
    </label>
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

const MAX_EDGE = 2400;

/**
 * Scales a photo down to MAX_EDGE px on its longest side and re-encodes it
 * (WebP, or JPEG where the browser cannot encode WebP). Phone photos drop from
 * 5–12 MB to well under 2 MB, so a full set of angles fits the upload limit.
 * Small images are returned unchanged.
 */
async function shrinkImage(file: File): Promise<{ file: File; width: number; height: number }> {
  const { width, height } = await readImageSize(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return { file, width, height };

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob || blob.size >= file.size) return { file, width, height };

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return { file: new File([blob], name, { type: blob.type }), width: w, height: h };
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
