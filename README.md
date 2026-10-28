# Fitness Equipment Asia — Frontend

Storefront prototype for Fitness Equipment Asia, built from the "V3 · A + B" design
(Iron Red, with elements from Black Steel). The UI is Thai-first.

> **Catalog + quotation site.** Products come from Supabase (or built-in sample data when
> Supabase is not configured). Quote and repair requests are saved to the database.
> There is no online ordering or payment for now: checkout is switched off
> (`checkoutEnabled` in `src/lib/site.ts`) and every product goes through the quote flow.
> Prices are shown **excluding VAT**.

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
| `/quote` | Quote basket + request form, saved via `submit_quote_request` (optional file attachment) |
| `/checkout` | Switched off (redirects to `/quote`); kept for if online ordering is added later |
| `/showroom` | Showroom, contact channels, guides, warranty, service request (saved to the database), FAQ |
| `/staff` | Staff unit-scan concept (no auth yet, `noindex`) |

## Where things live

- `src/lib/types.ts` — data contract (Product, Variant, StockUnit, QuoteRequest…)
- `src/lib/catalog.ts` — the only place pages read catalog data from (`products_public` view, or sample data)
- `src/lib/supabase.ts` — server-only Supabase clients; keys never reach the browser
- `src/app/(site)/quote/actions.ts`, `src/app/(site)/showroom/actions.ts` — Server Actions that save the forms
- `src/lib/data/` — sample products and stock (replace before launch)
- `src/lib/pricing.ts` — price modes; unknown prices are never shown as ฿0
- `src/lib/shop-store.ts` — quote basket, cart and currency kept in localStorage
- `src/lib/site.ts` — contact channels and showroom placeholders (`[...]` = owner must supply)

## The NEW badge

`product.isNew` drives it. In the database (backend repo), `products_public.is_new` is true when
`arrived_at` is within 45 days, unless staff set `new_override`. It is hidden on
out-of-stock items.

## Connecting Supabase

The database schema, security rules and form functions live in the
[backend repo](https://github.com/Mzknkung53/FitnessEquipmentASIA-Backend)
(`supabase/migrations/`, design notes in Thai in `docs/database-design.md`).

1. Create a Supabase project, then apply the backend migrations (`supabase db push`, or paste each
   migration file into the SQL Editor in name order). For demo products, also run `supabase/seed.sql` once.
2. Copy `.env.example` to `.env.local` and fill in the project URL, publishable key and secret key
   (Project Settings → API Keys). The secret key is used only in server code.
3. Upload the product photos to Storage:

   ```bash
   node --env-file=.env.local scripts/upload-product-images.mjs
   ```

4. `npm run dev`. Quote and repair requests then appear in the `quote_requests` / `service_requests`
   tables, with files in the private `quote-attachments` / `service-attachments` buckets.

Not connected yet: the `/staff` page (still sample data, needs staff login) and the USD rate
(`DEMO_THB_PER_USD`; the database has `current_exchange_rates`).
