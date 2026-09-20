"""Validate every public derivative, metadata policy and traceability."""
from pathlib import Path
import base64, hashlib, io, json
from PIL import Image

photos=json.loads(Path('data/gallery.json').read_text(encoding='utf8'))
plan=json.loads(Path('scripts/crop-plan.json').read_text(encoding='utf8'))
source_ids={r['id'] for r in plan if r.get('reviewed')}
pdf_plan=json.loads(Path('scripts/pdf-photo-plan.json').read_text(encoding='utf8'))
pdf_counts={};pdf_refs=set()
for crop in pdf_plan:
    page=crop['page'];pdf_counts[page]=pdf_counts.get(page,0)+1
    pdf_refs.add(f"pdf-{page:02d}-{pdf_counts[page]:02d}")
errors=[];references=set();hashes={};sizes=[]
for p in photos:
    source_ref=p['sourceRef']
    if source_ref.startswith('pdf-'):
        if source_ref not in pdf_refs: errors.append('Unreviewed PDF source: '+p['id'])
    elif int(source_ref.split('-')[0]) not in source_ids: errors.append('Unreviewed source: '+p['id'])
    if not p['alt'] or p['width']<=0 or p['height']<=0: errors.append('Invalid photo: '+p['id'])
    placeholder=p.get('placeholder','')
    if not placeholder.startswith('data:image/webp;base64,'):
        errors.append('Missing placeholder: '+p['id'])
    else:
        try:
            with Image.open(io.BytesIO(base64.b64decode(placeholder.split(',',1)[1],validate=True))) as preview:
                preview.load()
                if preview.format!='WEBP' or max(preview.size)>24: errors.append('Invalid placeholder: '+p['id'])
        except Exception:
            errors.append('Unreadable placeholder: '+p['id'])
    for v in p['versions']:
        path=Path('public'+v['src']);references.add(path.resolve())
        if not path.is_file():errors.append('Missing '+str(path));continue
        with Image.open(path) as im:
            im.load()
            if im.size!=(v['width'],v['height']):errors.append('Dimensions '+str(path))
            if im.getexif() or im.info.get('exif') or im.info.get('xmp'):errors.append('Metadata '+str(path))
            if im.width>p['width'] or im.height>p['height']:errors.append('Upscaled '+str(path))
        sizes.append(path.stat().st_size)
    last=Path('public'+p['versions'][-1]['src']);digest=hashlib.sha256(last.read_bytes()).hexdigest()
    if digest in hashes:errors.append('Identical public image '+p['id']+' / '+hashes[digest])
    hashes[digest]=p['id']
actual={p.resolve() for p in Path('public/photos').glob('*') if p.is_file()}
if actual-references:errors.append(f'{len(actual-references)} unreferenced derivatives')
for path in Path('public/brand').glob('*'):
    if path.suffix in ('.jpg','.webp','.png'):
        with Image.open(path) as im:
            if im.getexif() or im.info.get('exif') or im.info.get('xmp'):errors.append('Brand metadata '+str(path))
result=dict(photos=len(photos),derivatives=len(references),bytes=sum(sizes),errors=errors)
Path('data/verification.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result,ensure_ascii=False))
raise SystemExit(bool(errors))
