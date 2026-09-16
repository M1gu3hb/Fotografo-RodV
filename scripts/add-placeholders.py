"""Add tiny WebP placeholders to the generated gallery and site manifests."""
from pathlib import Path
import base64
import io
import json
from PIL import Image

gallery_path = Path('data/gallery.json')
site_path = Path('src/data/site.json')
photos = json.loads(gallery_path.read_text(encoding='utf8'))
by_id = {}

for photo in photos:
    source = Path('public' + photo['versions'][0]['src'])
    with Image.open(source) as image:
        tiny = image.convert('RGB')
        tiny.thumbnail((24, 24), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        tiny.save(output, format='WEBP', quality=38, method=4)
    photo['placeholder'] = 'data:image/webp;base64,' + base64.b64encode(output.getvalue()).decode('ascii')
    by_id[photo['id']] = photo

site = json.loads(site_path.read_text(encoding='utf8'))
site['hero'] = by_id[site['hero']['id']]
site['initial'] = [by_id[photo['id']] for photo in site['initial']]
for collection in site['collections']:
    collection['cover'] = by_id[collection['cover']['id']]
    collection['initial'] = [by_id[photo['id']] for photo in collection['initial']]

gallery_path.write_text(json.dumps(photos, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
site_path.write_text(json.dumps(site, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
print(f'Added placeholders to {len(photos)} photographs.')
