"use client";

import { useState, useTransition } from "react";
import { submitServiceRequest } from "@/app/(site)/showroom/actions";
import { Icon } from "@/components/icons";

const input = "min-h-[52px] w-full rounded-lg border border-control bg-white px-3.5 text-base font-normal";

export function ServiceForm() {
  const [sent, setSent] = useState<{ reference: string; attachmentFailed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startSending(async () => {
      const result = await submitServiceRequest(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent({ reference: result.reference, attachmentFailed: Boolean(result.attachmentFailed) });
    });
  };

  if (sent) {
    return (
      <div role="status" className="flash-in flex flex-col gap-3 rounded-[18px] bg-night p-9 text-white">
        <span className="flex items-center gap-2 font-display text-2xl font-bold"><Icon name="check" className="text-[#3ecf6e]" />ได้รับเรื่องแจ้งซ่อมแล้ว</span>
        <span className="flex flex-wrap items-center gap-2 text-muted-night">
          เลขอ้างอิง <span className="rounded-md bg-[#1f1d1a] px-3 py-1 font-mono text-lg text-white">{sent.reference}</span>
        </span>
        <span className="text-muted-night">ทีมงานจะติดต่อกลับเพื่อนัดตรวจเช็ก</span>
        {sent.attachmentFailed && <span className="text-[#e3b25a]">แนบไฟล์ไม่สำเร็จ กรุณาส่งรูปหรือวิดีโอให้ทีมงานพร้อมเลขอ้างอิงนี้</span>}
        <button type="button" onClick={() => setSent(null)} className="self-start underline">แจ้งเรื่องใหม่</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} aria-label="แจ้งซ่อม" className="flex flex-col gap-[18px] rounded-[18px] bg-stage p-6 sm:p-9">
      <span className="font-display text-[28px] font-bold">แจ้งซ่อม / ขอรับบริการ</span>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">รุ่นสินค้า<input name="product_model" required maxLength={60} placeholder="เช่น FEA-PL01" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>หมายเลขเครื่อง <span className="font-normal text-muted">(ไม่บังคับ)</span></span>
        <input name="unit_code" maxLength={60} className={input} />
        <span className="text-[13px] font-normal text-muted">ดูได้จากสติกเกอร์ QR ที่ตัวเครื่อง</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">อาการที่พบ<textarea name="symptom" required maxLength={4000} rows={3} className={`${input} py-3`} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>แนบรูปหรือวิดีโอ <span className="font-normal text-muted">(ไม่บังคับ · ไม่เกิน 20 MB)</span></span>
        <input type="file" name="attachment" accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime" className="min-h-14 rounded-[10px] border-[1.5px] border-dashed border-control bg-white p-3.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">LINE ID หรือเบอร์โทรศัพท์<input name="contact_value" required maxLength={160} className={input} /></label>
      {error && (
        <span role="alert" className="flex items-center gap-2 rounded-lg bg-[#fde8e9] px-4 py-3 text-[15px] font-semibold text-[#c8101a]">
          <Icon name="alert" className="shrink-0" /> {error}
        </span>
      )}
      <button type="submit" disabled={sending} className="min-h-[58px] rounded-lg bg-ink font-display text-lg font-semibold text-white disabled:opacity-60">
        {sending ? "กำลังส่ง…" : "ส่งเรื่องแจ้งซ่อม"}
      </button>
    </form>
  );
}
