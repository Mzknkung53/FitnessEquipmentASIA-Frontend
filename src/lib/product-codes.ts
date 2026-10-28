/** Category → short code prefix for sequential product IDs (e.g. plaload-0001). */
export const categoryPrefixes: Record<string, string> = {
  "plate-loaded": "plaload",
  cardio: "cardio",
  selectorized: "select",
  racks: "racks",
  "free-weights": "freewt",
  accessories: "access",
  flooring: "floor",
};

export function categoryPrefix(categoryId: string) {
  if (categoryPrefixes[categoryId]) return categoryPrefixes[categoryId];
  const cleaned = categoryId.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8);
  return cleaned || "item";
}

export function formatProductCode(prefix: string, seq: number) {
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

/** Highest N from codes like `plaload-0007` / `PLALOAD-0007`. */
export function maxSequence(codes: string[], prefix: string) {
  const re = new RegExp(`^${prefix}-(\\d+)$`, "i");
  let max = 0;
  for (const code of codes) {
    const m = code.match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}
