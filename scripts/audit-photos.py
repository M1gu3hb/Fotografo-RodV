"""Read-only source inventory and contact sheets. python scripts/audit-photos.py SOURCE"""
from pathlib import Path
import sys, json, hashlib
from PIL import Image, ImageOps, ImageDraw

root = Path(sys.argv[1]).resolve()
out = Path('private-audit'); out.mkdir(exist_ok=True)
files = sorted((p for p in root.rglob('*') if p.is_file() and 'site' not in p.relative_to(root).parts), key=lambda p: str(p.relative_to(root)).lower())
records, seen, thumbnails = [], {}, []
for i, p in enumerate(files):
    r = dict(id=i, source=p.relative_to(root).as_posix(), extension=p.suffix.lower(), bytes=p.stat().st_size)
    r['sha256'] = hashlib.sha256(p.read_bytes()).hexdigest()
    if r['sha256'] in seen: r['duplicateOf'] = seen[r['sha256']]
    else: seen[r['sha256']] = i
    if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.tif', '.tiff'):
        try:
            with Image.open(p) as src:
                im = ImageOps.exif_transpose(src).convert('RGB')
                r.update(width=im.width, height=im.height, aspect=round(im.width/im.height,4), orientation='landscape' if im.width>im.height else 'portrait' if im.height>im.width else 'square')
                small = im.resize((9,8)).convert('L'); pixels=list(small.getdata())
                r['dhash'] = f"{sum((pixels[y*9+x]>pixels[y*9+x+1]) << (y*8+x) for y in range(8) for x in range(8)):016x}"
                im.thumbnail((290,200))
                thumbnails.append((r,im.copy()))
        except Exception as e: r['error'] = str(e)
    else: r['status'] = 'non-image'
    records.append(r)
for offset in range(0,len(thumbnails),20):
    sheet=Image.new('RGB',(1200,1200),'#e6e6e6'); draw=ImageDraw.Draw(sheet)
    for j,(r,im) in enumerate(thumbnails[offset:offset+20]):
        x=(j%4)*300; y=(j//4)*240
        sheet.paste(im,(x+(300-im.width)//2,y))
        draw.text((x+5,y+202), f"{r['id']:03} | {r['width']}x{r['height']}",fill='black')
        draw.text((x+5,y+220),r['source'][:43],fill='black')
    sheet.save(out/f'contact-{offset//20:02}.jpg',quality=90)
(out/'inventory.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(dict(files=len(records),images=len(thumbnails),bytes=sum(r['bytes'] for r in records),exactDuplicates=sum('duplicateOf' in r for r in records),sheets=(len(thumbnails)+19)//20)))
