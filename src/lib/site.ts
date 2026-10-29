// Business details. Bracketed values are placeholders the owner must supply —
// never invent addresses, IDs or phone numbers.

export const contactChannels: { name: string; handle: string; href?: string }[] = [
  { name: "LINE", handle: "[LINE ID]" },
  { name: "WeChat", handle: "[WeChat ID]" },
  { name: "WhatsApp", handle: "[หมายเลข]" },
  { name: "Facebook", handle: "fitnessequipmentasia", href: "https://www.facebook.com/fitnessequipmentasia" },
  { name: "Instagram", handle: "[บัญชี]" },
  { name: "โทรศัพท์", handle: "[เบอร์โทรศัพท์]" },
];

/**
 * Repairs and warranty claims are handled in chat, not through a web form.
 * A channel without href shows its handle only; for LINE, use https://line.me/R/ti/p/@<id>.
 */
export const chatChannels: { name: string; handle: string; href?: string }[] = [
  { name: "Messenger", handle: "Fitness Equipment Asia", href: "https://m.me/fitnessequipmentasia" },
  { name: "LINE", handle: "[LINE ID]" },
];

export const showroom = {
  address: "[ที่อยู่โชว์รูม]",
  hours: "[วันและเวลาทำการ]",
  phone: "[เบอร์โทรศัพท์]",
};

/**
 * Online ordering is off: the site is a catalog + quotation tool for now and every
 * product goes through the quote flow. The checkout UI is kept for later, but the
 * database has no order or payment tables yet, so do not turn this on before those exist.
 */
export const checkoutEnabled = false;

export const destinationCountries = ["ไทย", "ลาว", "เมียนมา", "จีน", "ประเทศอื่น"];
