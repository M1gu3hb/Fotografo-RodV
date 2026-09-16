create table public.rodrigo_portfolio_photos (
  id text primary key,
  category text not null check (category in ('bodas', 'xv-anos', 'retratos')),
  alt text not null check (char_length(alt) between 8 and 240),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  versions jsonb not null check (jsonb_typeof(versions) = 'array' and jsonb_array_length(versions) between 1 and 3),
  placeholder text not null check (placeholder like 'data:image/webp;base64,%'),
  source_ref text not null check (source_ref ~ '^[0-9]{3}-[0-9]{2}$'),
  sort_order integer not null unique check (sort_order >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rodrigo_portfolio_photos is
  'Catálogo público y aislado de The Best Moment. Los binarios permanecen en Vercel; esta tabla sólo contiene metadatos web.';

create index rodrigo_portfolio_photos_category_order_idx
  on public.rodrigo_portfolio_photos (category, sort_order)
  where published is true;

alter table public.rodrigo_portfolio_photos enable row level security;

revoke all on table public.rodrigo_portfolio_photos from public;
revoke all on table public.rodrigo_portfolio_photos from anon, authenticated;
grant select on table public.rodrigo_portfolio_photos to anon, authenticated;

create policy "rodrigo_portfolio_public_read"
  on public.rodrigo_portfolio_photos
  for select
  to anon, authenticated
  using (published is true);
