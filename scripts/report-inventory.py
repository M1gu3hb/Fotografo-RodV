"""Join private source inventory, reviewed crop plan and published derivatives."""
from pathlib import Path
import json, csv

def read(path): return json.loads(Path(path).read_text(encoding='utf8'))
inventory=read('private-audit/inventory.json')
plan={r['source']:r for r in read('scripts/crop-plan.json')}
photos=read('data/gallery.json')
duplicates=read('private-audit/duplicates.json')
rows=[]
for record in inventory:
    row=dict(record); review=plan.get(row['source'],{})
    published=[p for p in photos if int(p['sourceRef'].split('-')[0])==review.get('id')]
    system=Path(row['source']).name.startswith('._') or not review and 'width' not in row and row['extension'] not in ('.mp4',)
    row.update(category=review.get('category'),kind=review.get('kind'),reviewNote=review.get('note'),reviewed=review.get('reviewed',False))
    row['technicalQuality']='not-an-image' if system or row['extension']=='.mp4' else 'unreadable' if 'error' in row else 'native-resolution-limited' if min(row['width'],row['height'])<1200 else 'sufficient-for-web'
    row['publishedPhotos']=[p['id'] for p in published]
    row['cropReferences']=[p['sourceRef'] for p in published]
    row['duplicateCrops']=[d for d in duplicates if d.get('source')==row['source']]
    row['publicationStatus']='system-file' if system else 'published-individual-photos' if published else 'video-outside-photo-gallery' if row['extension']=='.mp4' else 'excluded-or-review'
    rows.append(row)
Path('private-audit/final-inventory.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
fields=['id','source','extension','width','height','orientation','aspect','bytes','sha256','category','kind','technicalQuality','duplicateOf','publicationStatus','cropReferences','reviewNote']
with Path('private-audit/final-inventory.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(rows)
print(f'Private JSON and CSV audit: {len(rows)} files.')
