begin;

alter table public.rodrigo_portfolio_photos
  drop constraint if exists rodrigo_portfolio_photos_source_ref_check;

alter table public.rodrigo_portfolio_photos
  add constraint rodrigo_portfolio_photos_source_ref_check
  check (source_ref ~ '^(?:[0-9]{3}-[0-9]{2}|pdf-[0-9]{2}-[0-9]{2})$');

comment on constraint rodrigo_portfolio_photos_source_ref_check
  on public.rodrigo_portfolio_photos is
  'Trazabilidad a la fuente revisada: archivo original o recorte individual del PDF 2026.';

commit;
