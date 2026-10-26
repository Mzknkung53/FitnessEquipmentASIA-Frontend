import type { StockUnit, StockUnitState } from "@/lib/types";

// DEMO DATA for the staff concept screen. In production this comes from the
// backend after staff authentication; a QR code alone is never authorization.

export const sampleUnits: StockUnit[] = [
  { unitCode: "U-000184", sku: "FEA-PL01-SLV", serial: "[SN-ตัวอย่าง-184]", location: "คลัง A · แถว 2 · ช่อง 14", condition: "ใหม่ ยังไม่แกะกล่อง", state: "available", receivedAt: "12 ต.ค. 2026" },
  { unitCode: "U-000185", sku: "FEA-PL01-SLV", serial: "[SN-ตัวอย่าง-185]", location: "โชว์รูม · โซน Plate-Loaded", condition: "เครื่องโชว์", state: "showroom", receivedAt: "12 ต.ค. 2026" },
  { unitCode: "U-000201", sku: "FEA-PL02-BLK", serial: "[SN-ตัวอย่าง-201]", location: "พื้นที่รับของ", condition: "ใหม่", state: "inbound", receivedAt: "24 ต.ค. 2026" },
];

export const sampleSkuCounts: Record<string, Record<StockUnitState, number>> = {
  "FEA-PL01-SLV": { inbound: 4, available: 6, reserved: 2, showroom: 1, dispatched: 12, service: 1 },
  "FEA-PL02-BLK": { inbound: 3, available: 0, reserved: 1, showroom: 0, dispatched: 2, service: 0 },
};
