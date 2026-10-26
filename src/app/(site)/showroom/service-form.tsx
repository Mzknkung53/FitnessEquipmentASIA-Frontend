"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const input = "min-h-[52px] w-full rounded-lg border border-control bg-white px-3.5 text-base font-normal";

export function ServiceForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-[18px] bg-night p-9 text-white">
        <span className="flex items-center gap-2 font-display text-2xl font-bold"><Icon name="check" className="text-[#3ecf6e]" />ได้รับเรื่องแจ้งซ่อมแล้ว</span>
        <span className="text-muted-night">ต้นแบบ: ยังไม่ได้ส่งจริง · ทีมงานจะติดต่อกลับเพื่อนัดตรวจเช็ก</span>
        <button type="button" onClick={() => setSent(false)} className="self-start underline">แจ้งเรื่องใหม่</button>
      </div>
    );
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} aria-label="แจ้งซ่อม" className="flex flex-col gap-[18px] rounded-[18px] bg-stage p-6 sm:p-9">
      <span className="font-display text-[28px] font-bold">แจ้งซ่อม / ขอรับบริการ</span>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">รุ่นสินค้า<input required placeholder="เช่น FEA-PL01" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>หมายเลขเครื่อง <span className="font-normal text-muted">(ไม่บังคับ)</span></span>
        <input className={input} />
        <span className="text-[13px] font-normal text-muted">ดูได้จากสติกเกอร์ QR ที่ตัวเครื่อง</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">อาการที่พบ<textarea required rows={3} className={`${input} py-3`} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>แนบรูปหรือวิดีโอ <span className="font-normal text-muted">(ไม่บังคับ)</span></span>
        <input type="file" accept="image/*,video/*" className="min-h-14 rounded-[10px] border-[1.5px] border-dashed border-control bg-white p-3.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">LINE ID หรือเบอร์โทรศัพท์<input required className={input} /></label>
      <button type="submit" className="min-h-[58px] rounded-lg bg-ink font-display text-lg font-semibold text-white">ส่งเรื่องแจ้งซ่อม</button>
    </form>
  );
}
