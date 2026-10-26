"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icons";
import type { Product, StockUnit, StockUnitState } from "@/lib/types";

const stateMeta: Record<StockUnitState, { label: string; cls: string; bar: string }> = {
  inbound: { label: "กำลังรับเข้า", cls: "bg-[#15202f] text-[#8db8f0]", bar: "#8db8f0" },
  available: { label: "พร้อมขาย", cls: "bg-[#16261c] text-[#6cc28d]", bar: "#6cc28d" },
  reserved: { label: "จองแล้ว", cls: "bg-[#2a2010] text-[#e3b25a]", bar: "#e3b25a" },
  showroom: { label: "เครื่องโชว์", cls: "bg-[#262422] text-[#d8d3cc]", bar: "#d8d3cc" },
  dispatched: { label: "ส่งออกแล้ว / ขายแล้ว", cls: "bg-[#262422] text-[#bdb6ad]", bar: "#5a544d" },
  service: { label: "กักไว้ / ส่งซ่อม", cls: "bg-[#3a1416] text-[#ff5a61]", bar: "#ff5a61" },
};

type Action = { id: string; label: string; to?: StockUnitState; moveTo?: string };
const actions: Action[] = [
  { id: "receive", label: "รับเข้า", to: "available" },
  { id: "move", label: "ย้ายตำแหน่ง", moveTo: "โชว์รูม · โซน Plate-Loaded" },
  { id: "reserve", label: "จองให้คำสั่งซื้อ", to: "reserved" },
  { id: "dispatch", label: "ส่งออก", to: "dispatched" },
  { id: "service", label: "รับคืน / ส่งซ่อม", to: "service" },
];

type LogEntry = { at: string; what: string; detail: string; by: string };

export function StaffScan({ units: initial, skuCounts, products }: { units: StockUnit[]; skuCounts: Record<string, Record<StockUnitState, number>>; products: Product[] }) {
  const [units, setUnits] = useState(initial);
  const [query, setQuery] = useState(initial[0].unitCode);
  const [code, setCode] = useState(initial[0].unitCode);
  const [pending, setPending] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [log, setLog] = useState<Record<string, LogEntry[]>>({
    "U-000184": [
      { at: "12 ต.ค. 10:05", what: "ย้ายตำแหน่ง", detail: "พื้นที่รับของ → คลัง A · แถว 2 · ช่อง 14", by: "[พนักงาน A]" },
      { at: "12 ต.ค. 09:40", what: "รับเข้า", detail: "จากล็อตผลิต [เลขล็อต] · สภาพใหม่", by: "[พนักงาน A]" },
    ],
  });

  const unit = units.find((u) => u.unitCode === code);
  const product = unit && products.find((p) => p.variants.some((v) => v.sku === unit.sku));
  const variant = product?.variants.find((v) => v.sku === unit?.sku);
  const counts = unit ? skuCounts[unit.sku] : undefined;

  // Scanning only opens the record; any stock change needs an explicit, confirmed action.
  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(null);
    setCode(query.trim().toUpperCase());
  };

  const confirm = () => {
    if (!unit || !pending) return;
    const detail = pending.to ? `${stateMeta[unit.state].label} → ${stateMeta[pending.to].label}` : `${unit.location} → ${pending.moveTo}`;
    setUnits(units.map((u) => (u.unitCode === unit.unitCode ? { ...u, state: pending.to ?? u.state, location: pending.moveTo ?? u.location } : u)));
    setLog({ ...log, [unit.unitCode]: [{ at: "เมื่อสักครู่", what: pending.label, detail: note ? `${detail} · ${note}` : detail, by: "[ชื่อพนักงาน]" }, ...(log[unit.unitCode] ?? [])] });
    setPending(null);
    setNote("");
  };

  return (
    <main className="flex min-w-0 flex-[999_1_680px] flex-col gap-6 px-4 pt-8 pb-14 sm:px-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[52px] leading-none font-bold tracking-[-0.02em]">
          สแกน<span className="hollow-thin text-white">เครื่อง</span>
        </h1>
        <span className="text-sm text-muted-night">
          การสแกนเปิดข้อมูลเท่านั้น ไม่ตัดหรือเปลี่ยนสต็อกเอง · <span className="rounded border border-dashed border-[#5a544d] px-1.5">ข้อมูลตัวอย่าง</span>
        </span>
      </div>

      <form role="search" onSubmit={lookup} className="flex flex-wrap gap-2.5">
        <label className="relative flex-[1_1_320px]">
          <span className="sr-only">รหัสเครื่อง SKU หรือรุ่น</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-[58px] w-full rounded-[10px] border border-[#3d3934] bg-night-2 pr-4 pl-[52px] font-mono text-lg" />
          <Icon name="search" size={20} className="absolute top-[19px] left-[18px] text-muted-night" />
        </label>
        <button type="submit" className="min-h-[58px] rounded-[10px] border border-[#3d3934] px-5 font-semibold">ค้นหา</button>
        <button type="button" className="inline-flex min-h-[58px] items-center gap-2.5 rounded-[10px] bg-brand px-[22px] font-display text-[17px] font-semibold" title="ต้องเชื่อมต่อกล้องในเวอร์ชันจริง">
          <Icon name="scan" size={20} /> สแกนด้วยกล้อง
        </button>
      </form>

      {!unit || !product || !variant ? (
        <div className="rounded-2xl border border-[#26231f] bg-night-2 p-8 text-muted-night">ไม่พบรหัสเครื่อง “{code}” · ลอง U-000184, U-000185 หรือ U-000201</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <span className="rounded-full border border-[#26231f] bg-night-2 px-3.5 py-2"><span className="text-muted-night">รุ่น ·</span> {product.nameEn}</span>
            <span className="text-[#5a544d]">→</span>
            <span className="rounded-full border border-[#26231f] bg-night-2 px-3.5 py-2"><span className="text-muted-night">SKU ·</span> <span className="font-mono">{unit.sku}</span></span>
            <span className="text-[#5a544d]">→</span>
            <span className="rounded-full bg-white px-3.5 py-2 font-semibold text-night"><span className="opacity-60">เครื่องจริง ·</span> <span className="font-mono">{unit.unitCode}</span></span>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            <section aria-label="ข้อมูลเครื่อง" className="flex min-w-0 flex-[999_1_480px] flex-col gap-[22px] rounded-2xl border border-[#26231f] bg-night-2 p-[26px]">
              <div className="flex flex-wrap items-center gap-[22px]">
                <div className="grid aspect-square w-[150px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#ecebe8]">
                  {product.image && <Image src={product.image.src} alt="" width={product.image.width} height={product.image.height} sizes="150px" className="blend-stage h-[90%] w-[90%] object-contain" />}
                </div>
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                  <span className="font-mono text-[26px]">{unit.unitCode}</span>
                  <span className="font-display text-[22px] font-semibold">{product.nameEn} · {variant.label}</span>
                  <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-semibold ${stateMeta[unit.state].cls}`}>
                    <span className="size-2 rounded-full bg-current" />
                    {stateMeta[unit.state].label}
                  </span>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-[18px] border-t border-[#26231f] pt-[18px] md:grid-cols-3">
                <Kv k="SKU" v={unit.sku} mono />
                <Kv k="ซีเรียลผู้ผลิต" v={unit.serial} mono />
                <Kv k="ตำแหน่ง" v={unit.location} />
                <Kv k="สภาพ" v={unit.condition} />
                <Kv k="รับเข้าเมื่อ" v={unit.receivedAt} />
                <Kv k="คำสั่งซื้อ / ประกัน" v="ยังไม่ผูก" muted />
              </dl>
              <div className="flex flex-col gap-2.5 border-t border-[#26231f] pt-[18px]">
                <span className="font-semibold">ทำรายการกับเครื่องนี้</span>
                <div className="flex flex-wrap gap-2">
                  {actions.map((a) => (
                    <button key={a.id} type="button" onClick={() => setPending(a)} className={`min-h-12 rounded-lg border px-[18px] text-[15px] font-semibold ${pending?.id === a.id ? "border-white" : "border-[#3d3934] hover:border-white"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              {pending && (
                <div role="dialog" aria-label="ยืนยันรายการ" className="flex flex-col gap-4 rounded-[14px] bg-white p-[22px] text-ink">
                  <span className="font-display text-2xl font-bold">ยืนยัน: {pending.label}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <span className="flex flex-col"><span className="text-xs text-muted">เครื่อง</span><span className="font-mono">{unit.unitCode} · 1 เครื่อง</span></span>
                    <span className="flex flex-col"><span className="text-xs text-muted">หลังทำรายการ</span><span className="font-semibold">{pending.to ? stateMeta[pending.to].label : `ตำแหน่งใหม่: ${pending.moveTo}`}</span></span>
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    หมายเหตุ / เลขอ้างอิง (ไม่บังคับ)
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น เลขคำสั่งซื้อ" className="min-h-12 rounded-lg border border-control px-3 font-normal" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={confirm} className="min-h-[50px] rounded-lg bg-brand px-6 font-semibold text-white">ยืนยันรายการ</button>
                    <button type="button" onClick={() => setPending(null)} className="min-h-[50px] px-4 underline">ยกเลิก</button>
                  </div>
                </div>
              )}
            </section>

            <section aria-label="QR" className="flex min-w-0 flex-[1_1_260px] flex-col gap-3.5">
              <div className="flex flex-col gap-2.5 rounded-2xl border border-[#26231f] bg-night-2 p-[22px]">
                <span className="font-semibold">QR ภายใน · ติดที่ตัวเครื่อง</span>
                <span className="grid size-[132px] place-items-center rounded-[10px] bg-white text-night"><Icon name="qr" size={96} strokeWidth={1.2} /></span>
                <span className="font-mono text-[13px] text-muted-night">…/u/{unit.unitCode}</span>
                <span className="text-[13px] text-muted-night">เก็บแค่รหัสเครื่อง ไม่มีราคา ข้อมูลลูกค้า หรือรหัสผ่าน ต้องล็อกอินก่อนเห็นข้อมูล</span>
                <button type="button" className="min-h-12 rounded-lg border border-[#3d3934] font-semibold hover:border-white">พิมพ์ฉลาก QR</button>
              </div>
              <div className="flex flex-col gap-1.5 rounded-2xl border border-[#26231f] bg-night-2 p-[22px]">
                <span className="font-semibold">QR สาธารณะ · ป้ายในโชว์รูม</span>
                <span className="font-mono text-[13px] break-all text-muted-night">/products/{product.slug}?v={unit.sku}</span>
                <span className="text-[13px] text-muted-night">เปิดหน้าสินค้าและเลือกรุ่นย่อยนี้ไว้ให้</span>
              </div>
            </section>
          </div>

          {counts && (
            <section aria-label="สรุปสต็อก" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold">สต็อก {unit.sku} ทุกคลัง</h2>
                <span className="text-sm text-muted-night">ขายได้ทันที = เฉพาะ “พร้อมขาย” · ไม่นับเครื่องจองหรือเครื่องโชว์</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
                {(Object.keys(stateMeta) as StockUnitState[]).map((s) => (
                  <div key={s} className="flex flex-col rounded-[10px] border border-[#26231f] bg-night-2 px-[18px] py-4" style={{ borderTop: `3px solid ${stateMeta[s].bar}` }}>
                    <span className="text-[13px] text-muted-night">{stateMeta[s].label}</span>
                    <span className="font-display text-4xl leading-tight font-bold">{counts[s]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section aria-label="ประวัติ" className="flex flex-col gap-2 overflow-x-auto rounded-2xl border border-[#26231f] bg-night-2 px-6 py-[22px]">
            <h2 className="font-display text-[22px] font-semibold">ประวัติเครื่องนี้</h2>
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[13px] text-muted-night">
                  <th scope="col" className="border-b border-night-line py-2.5 pr-3 font-semibold">เวลา</th>
                  <th scope="col" className="border-b border-night-line py-2.5 pr-3 font-semibold">รายการ</th>
                  <th scope="col" className="border-b border-night-line py-2.5 pr-3 font-semibold">รายละเอียด</th>
                  <th scope="col" className="border-b border-night-line py-2.5 font-semibold">โดย</th>
                </tr>
              </thead>
              <tbody>
                {(log[unit.unitCode] ?? []).map((l, i) => (
                  <tr key={i} className="align-top">
                    <td className="border-b border-[#26231f] py-3 pr-3 font-mono text-muted-night">{l.at}</td>
                    <td className="border-b border-[#26231f] py-3 pr-3 font-semibold">{l.what}</td>
                    <td className="border-b border-[#26231f] py-3 pr-3 text-[#d8d3cc]">{l.detail}</td>
                    <td className="border-b border-[#26231f] py-3">{l.by}</td>
                  </tr>
                ))}
                {(log[unit.unitCode] ?? []).length === 0 && (
                  <tr><td colSpan={4} className="py-3 text-muted-night">ยังไม่มีประวัติ</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}

function Kv({ k, v, mono, muted }: { k: string; v: string; mono?: boolean; muted?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-night">{k}</dt>
      <dd className={`${mono ? "font-mono" : "font-semibold"} ${muted ? "font-normal text-muted-night" : ""}`}>{v}</dd>
    </div>
  );
}
