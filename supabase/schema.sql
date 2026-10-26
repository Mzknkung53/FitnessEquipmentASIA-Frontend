-- DRAFT schema for Supabase (Postgres). Not final — review with the owner before use.
-- Mirrors src/lib/types.ts. Public storefront reads only the *_public views;
-- costs, exact stock and customer data stay behind RLS for staff roles.

create type stock_status as enum ('ready', 'preorder', 'import', 'out');
create type unit_state as enum ('inbound', 'available', 'reserved', 'showroom', 'dispatched', 'service');
create type contact_method as enum ('line', 'wechat', 'whatsapp', 'phone', 'email');
create type quote_status as enum ('new', 'reviewing', 'quoted', 'won', 'lost');

create table categories (
  id text primary key,                -- 'plate-loaded', 'cardio', ...
  name_th text not null,
  name_en text not null,
  sort int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  model text not null,
  name_en text not null,
  name_th text not null,
  name_zh text,
  category_id text not null references categories(id),
  summary text,
  setting text[] not null default '{}',           -- {'home','commercial'}
  arrived_at date,                                 -- drives the NEW badge
  new_override boolean,                            -- staff can force NEW on/off
  curated_rank int,
  image_path text,                                 -- Supabase Storage path
  image_width int,
  image_height int,
  pictogram text,
  unit_note text,
  specs jsonb not null default '[]',               -- [{label, value}]
  usage_steps text[] not null default '{}',
  manual_path text,
  video_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table variants (
  sku text primary key,
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  swatch text,
  stock_status stock_status not null default 'import',
  price_thb numeric(12, 2),                        -- null = quote only (never 0)
  lead_time text,
  package_dims_cm text,                            -- staff only, for shipping estimates
  package_weight_kg numeric(8, 2),
  cost_thb numeric(12, 2)                          -- staff only
);

create table stock_units (
  unit_code text primary key,                      -- encoded in the internal QR
  sku text not null references variants(sku),
  serial text,
  location text not null,
  condition text,
  state unit_state not null default 'inbound',
  received_at date
);

create table stock_movements (
  id bigint generated always as identity primary key,
  unit_code text not null references stock_units(unit_code),
  action text not null,                            -- receive / move / reserve / dispatch / service
  from_value text,
  to_value text,
  note text,
  actor uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  contact_name text not null,
  company text,
  contact_method contact_method not null,
  contact_value text not null,
  country text not null,
  city text not null,
  postcode text,
  installation text check (installation in ('yes', 'no', 'unsure')),
  access jsonb not null default '{}',
  target_date date,
  budget text,
  message text,
  floor_plan_path text,
  status quote_status not null default 'new',
  created_at timestamptz not null default now()
);

create table quote_items (
  id bigint generated always as identity primary key,
  quote_id uuid not null references quote_requests(id) on delete cascade,
  sku text not null references variants(sku),
  qty int not null check (qty > 0),
  note text
);

-- Public read model: published products only, no cost / package / exact stock.
create view products_public as
select
  p.slug, p.model, p.name_en, p.name_th, p.name_zh, p.category_id, p.summary, p.setting,
  coalesce(p.new_override, p.arrived_at > current_date - interval '45 days') as is_new,
  p.curated_rank, p.image_path, p.image_width, p.image_height, p.pictogram, p.unit_note,
  p.specs, p.usage_steps, p.manual_path, p.video_url,
  (select json_agg(json_build_object(
     'sku', v.sku, 'label', v.label, 'swatch', v.swatch,
     'status', v.stock_status, 'price_thb', v.price_thb, 'lead_time', v.lead_time))
   from variants v where v.product_id = p.id) as variants
from products p
where p.status = 'published';

alter table quote_requests enable row level security;
alter table quote_items enable row level security;
alter table stock_units enable row level security;
alter table stock_movements enable row level security;
-- TODO: policies — anon may INSERT quote_requests/quote_items via an RPC that
-- validates input; only authenticated staff roles may SELECT/UPDATE.
