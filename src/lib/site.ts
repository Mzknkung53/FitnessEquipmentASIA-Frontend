// Business details. Bracketed values are placeholders the owner must supply —
// never invent addresses, IDs or phone numbers.

/** Channel names are translated through t.contact.channels[id]. */
export type ChannelId = "line" | "wechat" | "whatsapp" | "facebook" | "messenger" | "instagram" | "phone";
type Channel = { id: ChannelId; handle: string; href?: string };

export const contactChannels: Channel[] = [
  { id: "line", handle: "[LINE ID]" },
  { id: "wechat", handle: "[WeChat ID]" },
  { id: "whatsapp", handle: "[หมายเลข]" },
  { id: "facebook", handle: "fitnessequipmentasia", href: "https://www.facebook.com/fitnessequipmentasia" },
  { id: "instagram", handle: "[บัญชี]" },
  { id: "phone", handle: "086 923 9903", href: "tel:+66869239903" },
];

/**
 * Repairs and warranty claims are handled in chat, not through a web form.
 * A channel without href shows its handle only; for LINE, use https://line.me/R/ti/p/@<id>.
 */
export const chatChannels: Channel[] = [
  { id: "messenger", handle: "Fitness Equipment Asia", href: "https://m.me/fitnessequipmentasia" },
  { id: "line", handle: "[LINE ID]" },
];

/** Shared phone for both branches. */
export const showroomPhone = { display: "086 923 9903", tel: "tel:+66869239903" };

/**
 * The showroom is inside the owner's working gyms (Pump Fitness, Chiang Mai): customers
 * try machines in a real gym. Details as listed on Google Maps. Opening hours are not
 * confirmed yet, so the page shows t.showroom.hoursTbc until `hours` is filled in.
 */
export type Branch = {
  id: string;
  name: string;
  /** Short place name per language. */
  area: { th: string; en: string; zh: string };
  /** Postal address per language (Chinese visitors get the English one). */
  address: { th: string; en: string };
  hours?: { th: string; en: string; zh: string };
  /** Google Maps search text: opens the branch's listing. */
  mapsQuery: string;
};

export const branches: Branch[] = [
  {
    id: "chiang-mai-gate",
    name: "Pump Fitness 2.0",
    area: { th: "ใกล้ประตูเชียงใหม่ (เมืองเก่า)", en: "Near Chiang Mai Gate, Old City", zh: "清迈门附近（古城）" },
    address: {
      th: "89, 89/1-3 ถนนบำรุงบุรี ต.พระสิงห์ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200",
      en: "89, 89/1-3 Bamrung Buri Rd, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200",
    },
    mapsQuery: "Pump Fitness 2.0 Gym Near Chiang Mai Gate, 89 Bamrung Buri Rd, Chiang Mai",
  },
  {
    id: "chang-phuak",
    name: "Pump Fitness & Gym",
    area: { th: "ถนนช้างเผือก", en: "Chang Phuak Road", zh: "白象门附近（Chang Phuak 路）" },
    address: {
      th: "Chang Phuak Residence 25/1 ถนนช้างเผือก ต.ช้างเผือก อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200",
      en: "Chang Phuak Residence, 25/1 Chang Phuak Rd, Chang Phueak, Mueang Chiang Mai, Chiang Mai 50200",
    },
    mapsQuery: "PUMP FITNESS AND GYM CHIANG MAI, 25/1 Chang Phuak Rd, Chiang Mai",
  },
];

export const mapsLink = (b: Branch) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapsQuery)}`;
export const mapsEmbed = (b: Branch) => `https://www.google.com/maps?q=${encodeURIComponent(b.mapsQuery)}&z=16&output=embed`;

/**
 * Online ordering is off: the site is a catalog + quotation tool for now and every
 * product goes through the quote flow. The checkout UI is kept for later, but the
 * database has no order or payment tables yet, so do not turn this on before those exist.
 */
export const checkoutEnabled = false;

/** Saved with the quote in Thai; t.quote.countries holds the label in each language (same order). */
export const destinationCountries = ["ไทย", "ลาว", "เมียนมา", "จีน", "ประเทศอื่น"];
