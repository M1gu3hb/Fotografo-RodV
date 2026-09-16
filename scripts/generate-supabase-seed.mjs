import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const photos = JSON.parse(readFileSync('data/gallery.json', 'utf8'));
const output = 'supabase/seed';
const chunkSize = 50;
mkdirSync(output, { recursive: true });
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (let offset = 0; offset < photos.length; offset += chunkSize) {
  const rows = photos.slice(offset, offset + chunkSize).map((photo, index) => ({
    ...photo,
    sort_order: offset + index,
  }));
  const number = String(offset / chunkSize + 1).padStart(2, '0');
  const sql = `insert into public.rodrigo_portfolio_photos
  (id, category, alt, width, height, versions, placeholder, source_ref, sort_order, published)
select id, category, alt, width, height, versions, placeholder, "sourceRef", sort_order, true
from jsonb_to_recordset($gallery$${JSON.stringify(rows)}$gallery$::jsonb)
  as x(id text, category text, alt text, width integer, height integer, versions jsonb, placeholder text, "sourceRef" text, sort_order integer)
on conflict (id) do update set
  category = excluded.category,
  alt = excluded.alt,
  width = excluded.width,
  height = excluded.height,
  versions = excluded.versions,
  placeholder = excluded.placeholder,
  source_ref = excluded.source_ref,
  sort_order = excluded.sort_order,
  published = true,
  updated_at = now();\n`;
  writeFileSync(`${output}/rodrigo_portfolio_${number}.sql`, sql);
}

console.log(`Generated ${Math.ceil(photos.length / chunkSize)} seed batches for ${photos.length} photographs.`);
