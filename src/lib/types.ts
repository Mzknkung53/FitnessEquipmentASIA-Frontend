// Conceptual data contract for the storefront. Field names map 1:1 to the
// products_public view in the backend repo's Supabase schema (snake_case there, camelCase here).

export type StockStatus = "ready" | "preorder" | "import" | "out";

/** exact = fixed price, from = starting price (depends on variant), ask = quote only */
export type PriceMode = "exact" | "from" | "ask";

export type CategoryId =
  | "plate-loaded"
  | "cardio"
  | "selectorized"
  | "racks"
  | "free-weights"
  | "accessories"
  | "flooring";

export type PictogramKind =
  | "treadmill"
  | "bike"
  | "rack"
  | "bench"
  | "dumbbell"
  | "plate"
  | "machine"
  | "rower"
  | "kettlebell"
  | "flooring";

export type Category = {
  id: CategoryId;
  nameTh: string;
  nameEn: string;
};

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** A sellable configuration (model + colour/spec). Price and stock live here. */
export type Variant = {
  sku: string;
  label: string;
  swatch: string;
  status: StockStatus;
  /** null = no published price, quote only */
  priceThb: number | null;
  /** Shown only when supplied by staff; otherwise "สอบถามระยะเวลาจัดส่ง". */
  leadTime?: string;
};

export type Spec = { label: string; value: string };

export type Product = {
  slug: string;
  model: string;
  nameEn: string;
  nameTh: string;
  category: CategoryId;
  summary: string;
  setting: Array<"home" | "commercial">;
  /** Staff-controlled or computed from arrival date (see schema view). */
  isNew: boolean;
  /** Lower = shown first in "ทีมงานแนะนำ". */
  curatedRank: number;
  image?: ProductImage;
  pictogram?: PictogramKind;
  variants: Variant[];
  specs: Spec[];
  usageSteps: string[];
  unitNote?: string;
  /** Marks sample content that must be replaced before launch. */
  demo: boolean;
};

export type StockUnitState =
  | "inbound"
  | "available"
  | "reserved"
  | "showroom"
  | "dispatched"
  | "service";

/** One physical machine, identified by the internal unit QR. */
export type StockUnit = {
  unitCode: string;
  sku: string;
  serial: string;
  location: string;
  condition: string;
  state: StockUnitState;
  receivedAt: string;
};

export type ContactMethod = "line" | "wechat" | "whatsapp" | "phone" | "email";

export type QuoteItem = {
  sku: string;
  slug: string;
  qty: number;
  note?: string;
};

export type QuoteRequest = {
  contactName: string;
  company?: string;
  contactMethod: ContactMethod;
  contactValue: string;
  country: string;
  city: string;
  postcode?: string;
  installation: "yes" | "no" | "unsure";
  access: { upperFloor: boolean; lift: boolean; stairs: boolean; truckAccess: boolean };
  targetDate?: string;
  budget?: string;
  message?: string;
  items: QuoteItem[];
};
