# Fitness Equipment Asia — Frontend

Storefront prototype for Fitness Equipment Asia, built from the "V3 · A + B" design
(Iron Red, with elements from Black Steel). The UI is Thai-first.

> **Prototype.** All products, prices, specs and contact details are sample data.
> Quote requests and checkout are simulated: nothing is sent, charged or reserved.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 (brand tokens in `src/app/globals.css`)
- Fonts: Kanit (headings) and IBM Plex Sans Thai (body), via `next/font`

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Pages

| Path | What it shows |
| --- | --- |
| `/` | Home: hero, categories, new arrivals (NEW badge), gym projects, showroom |
| `/products` | Listing: category tiles, status/price/setting filters, THB/USD, sort |
| `/products/[slug]` | Product detail: variants (`?v=SKU` preselects, e.g. from a QR), buy vs. quote by price mode |
| `/quote` | Quote basket + request form with validation (simulated submit) |
| `/checkout` | 4-step checkout for fixed-price, in-stock items only (payments not connected) |
| `/showroom` | Showroom, contact channels, guides, warranty, service request, FAQ |
| `/staff` | Staff unit-scan concept (no auth yet, `noindex`) |

## Where things live

- `src/lib/types.ts` — data contract (Product, Variant, StockUnit, QuoteRequest…)
- `src/lib/catalog.ts` — the only place pages read catalog data from. Swap the sample data for Supabase here.
- `src/lib/data/` — sample products and stock (replace before launch)
- `src/lib/pricing.ts` — price modes; unknown prices are never shown as ฿0
- `src/lib/shop-store.ts` — quote basket, cart and currency kept in localStorage
- `src/lib/site.ts` — contact channels and showroom placeholders (`[...]` = owner must supply)
- `supabase/schema.sql` — draft database schema, not final

## The NEW badge

`product.isNew` drives it. In the draft schema, `products_public.is_new` is true when
`arrived_at` is within 45 days, unless staff set `new_override`. It is hidden on
out-of-stock items.

## Connecting Supabase (next step)

1. `npm install @supabase/supabase-js` and set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Apply `supabase/schema.sql` (after review) and upload product photos to Storage.
3. Replace the bodies in `src/lib/catalog.ts` with queries on `products_public`.
4. Replace the simulated submit in `src/app/(site)/quote/quote-client.tsx` with a server action that inserts `quote_requests` + `quote_items`.
