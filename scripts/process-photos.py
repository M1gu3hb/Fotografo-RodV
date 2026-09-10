"""Generate non-destructive, color-managed web derivatives from reviewed crop plan."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import sys, json, hashlib, io
import numpy as np
import cv2
from PIL import Image, ImageOps, ImageCms, ImageFilter, ImageDraw

root=Path(sys.argv[1]).resolve(); audit=Path('private-audit'); audit.mkdir(exist_ok=True)
plan=json.loads(Path('scripts/crop-plan.json').read_text(encoding='utf8'))
cache=audit/'candidates';cache.mkdir(exist_ok=True)
def open_rgb(path):
    with Image.open(path) as source:
        im=ImageOps.exif_transpose(source)
        icc=source.info.get('icc_profile')
        if icc:
            try: im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(icc)),ImageCms.createProfile('sRGB'),outputMode='RGB')
            except (OSError,ValueError): im=im.convert('RGB')
        else: im=im.convert('RGB')
        return im.copy()
def fingerprint(im):
    a=np.asarray(im.resize((32,32)).convert('L'),dtype=np.float32)
    d=cv2.dct(a)[:8,:8].flatten();ph=sum(int(v>np.median(d[1:]))<<j for j,v in enumerate(d))
    b=np.asarray(im.resize((9,8)).convert('L'));dh=sum(int(v)<<j for j,v in enumerate((b[:,:-1]>b[:,1:]).flatten()))
    return ph,dh
def candidates(r):
    if not r.get('reviewed') or not r['crops']: return []
    im=open_rgb(root/r['source']); output=[]
    for n,(x,y,u,v) in enumerate(r['crops']):
        box=[round(x*im.width),round(y*im.height),round(u*im.width),round(v*im.height)]
        assert 0<=box[0]<box[2]<=im.width and 0<=box[1]<box[3]<=im.height
        crop=im.crop(box);ident=f"{r['id']:03}-{n:02}"
        if r['kind']=='composite':
            # Remove print-frame residues only within the outer 6% of each edge.
            a=np.asarray(crop.resize((min(400,crop.width),min(400,crop.height))))
            edges=[]
            for side in [a,a[::-1],a.transpose(1,0,2),a.transpose(1,0,2)[::-1]]:
                limit=max(2,int(len(side)*.06));last=0
                for j in range(limit):
                    if np.max(np.std(side[j].astype(float),axis=0))<14:last=j+1
                edges.append(max(.008,(last+1)/len(side) if last else .008))
            top,bottom,left,right=edges
            w,h=crop.size
            box=[box[0]+round(w*left),box[1]+round(h*top),box[2]-round(w*right),box[3]-round(h*bottom)]
            crop=im.crop(box)
        ph,dh=fingerprint(crop)
        item=dict(id=ident,sourceId=r['id'],source=r['source'],box=box,width=crop.width,height=crop.height,category=r['category'],kind=r['kind'],phash=str(ph),dhash=str(dh),pixels=crop.width*crop.height)
        thumb=crop.copy();thumb.thumbnail((360,260));thumb.save(cache/f'{ident}.jpg',quality=91)
        output.append(item)
    return output
candidate_path=audit/'candidates.json'
if '--resume' in sys.argv and candidate_path.exists(): allc=json.loads(candidate_path.read_text(encoding='utf8'))
else:
    with ThreadPoolExecutor(max_workers=4) as pool: allc=[c for group in pool.map(candidates,plan) for c in group]
    candidate_path.write_text(json.dumps(allc,ensure_ascii=False,indent=2),encoding='utf8')
kept=[]; duplicates=[]; near=[]
visual=json.loads(Path('scripts/visual-duplicates.json').read_text()) if Path('scripts/visual-duplicates.json').exists() else {}
manual=json.loads(Path('scripts/manual-duplicates.json').read_text()) if Path('scripts/manual-duplicates.json').exists() else {}
excluded=json.loads(Path('scripts/photo-exclusions.json').read_text()) if Path('scripts/photo-exclusions.json').exists() else {}
for c in sorted(allc,key=lambda c:(c['kind']=='single',c['pixels']),reverse=True):
    if c['id'] in excluded:continue
    if c['id'] in manual:
        duplicates.append(dict(id=c['id'],duplicateOf=manual[c['id']],reason='visually-confirmed',source=c['source']));continue
    if c['id'] in visual:
        duplicates.append(dict(id=c['id'],duplicateOf=visual[c['id']]['duplicateOf'],reason='aligned-pixel-match',source=c['source']));continue
    duplicate=None
    for k in kept:
        if c['category']!=k['category']:continue
        pd=(int(c['phash'])^int(k['phash'])).bit_count();dd=(int(c['dhash'])^int(k['dhash'])).bit_count()
        if pd<=8 and dd<=10:
            duplicate=k;break
        if pd<=16 and dd<=18:near.append([c['id'],k['id'],pd,dd])
    if duplicate:duplicates.append(dict(id=c['id'],duplicateOf=duplicate['id'],reason='perceptual-match',source=c['source']))
    elif min(c['width'],c['height'])>=360:kept.append(c)
    else: c['excluded']='Insufficient native resolution';duplicates.append(dict(id=c['id'],reason='low-resolution',source=c['source']))
kept.sort(key=lambda c:c['id'])
(audit/'duplicates.json').write_text(json.dumps(duplicates,ensure_ascii=False,indent=2),encoding='utf8')
(audit/'near-duplicates.json').write_text(json.dumps(near,indent=2),encoding='utf8')
(audit/'selected.json').write_text(json.dumps(kept,ensure_ascii=False,indent=2),encoding='utf8')
for offset in range(0,len(kept),40):
    sheet=Image.new('RGB',(1600,1500),'#ddd');draw=ImageDraw.Draw(sheet)
    for j,c in enumerate(kept[offset:offset+40]):
        im=Image.open(cache/f"{c['id']}.jpg");im.thumbnail((195,260))
        x=j%8*200;y=j//8*300;sheet.paste(im,(x+(200-im.width)//2,y));draw.text((x+4,y+265),f"{c['id']} {c['width']}x{c['height']}",fill='black')
    sheet.save(audit/f'selected-{offset//40:02}.jpg',quality=92)
print(json.dumps(dict(candidates=len(allc),selected=len(kept),duplicates=len(duplicates),near=len(near))),flush=True)
if '--review-only' in sys.argv:sys.exit()
public=Path('public/photos');public.mkdir(parents=True,exist_ok=True)
excluded=json.loads(Path('scripts/photo-exclusions.json').read_text()) if Path('scripts/photo-exclusions.json').exists() else {}
kept=[c for c in kept if c['id'] not in excluded]
grouped={}
for c in kept:grouped.setdefault(c['source'],[]).append(c)
def export(group):
    source,items=group;im=open_rgb(root/source);result=[]
    source_hash=hashlib.sha256((root/source).read_bytes()).hexdigest()
    for c in items:
        crop=im.crop(c['box']);versions=[]
        digest=hashlib.sha256((c['id']+str(c['box'])+source_hash+'quality-v1').encode()).hexdigest()[:10]
        slug=f"{c['category']}-{c['id']}-{digest}"
        for maxedge,quality in [(480,88),(1200,92),(2400,94)]:
            derivative=crop.copy();derivative.thumbnail((maxedge,maxedge),Image.Resampling.LANCZOS)
            if versions and derivative.size==(versions[-1]['width'],versions[-1]['height']):continue
            if maxedge>480 and max(crop.size)>maxedge:derivative=derivative.filter(ImageFilter.UnsharpMask(radius=.6,percent=35,threshold=3))
            path=public/f'{slug}-{derivative.width}.webp'
            if not path.exists():derivative.save(path,'WEBP',quality=quality,method=4,exif=b'')
            versions.append(dict(src='/photos/'+path.name,width=derivative.width,height=derivative.height,bytes=path.stat().st_size))
        context='Escena de boda' if c['category']=='bodas' else 'Celebración de XV años' if c['category']=='xv-anos' else 'Retrato de estudio'
        descriptions={'018-00':'Pareja de novios frente a una fachada histórica de piedra','004-00':'Retrato con vestido rosa junto a un muro de piedra y vegetación','002-00':'Pareja de novios entre muros de piedra bajo luz natural','017-00':'Retrato con vestido rojo junto a una pared de ladrillo','032-00':'Pareja de novios bajo un arco de piedra','008-00':'Pareja de novios sobre un puente de madera','021-00':'Pareja de novios en una sesión nocturna','033-00':'Retrato de XV años con vestido magenta en un jardín','015-00':'Pareja de novios frente a una puerta labrada','320-00':'Pareja de novios junto a un muro de color terracota','322-00':'Pareja abrazada bajo un cielo azul','260-00':'Siluetas de una pareja junto al agua al atardecer'}
        context=descriptions.get(c['id'],context)
        result.append(dict(id=slug,category=c['category'],alt=context+' · fotografía de Rodrigo Vargas',width=c['width'],height=c['height'],versions=versions,sourceRef=c['id']))
    return result
with ThreadPoolExecutor(max_workers=4) as pool:photos=[p for group in pool.map(export,grouped.items()) for p in group]
hero_order=['018-00','004-00','002-00','017-00','032-00','008-00','021-00','033-00','015-00','320-00','322-00','260-00']
photos.sort(key=lambda p:hero_order.index(p['sourceRef']) if p['sourceRef'] in hero_order else 1000+int(p['sourceRef'].split('-')[0]))
Path('data').mkdir(exist_ok=True);Path('src/data').mkdir(exist_ok=True)
Path('data/gallery.json').write_text(json.dumps(photos,ensure_ascii=False,separators=(',',':')),encoding='utf8')
referenced={Path(v['src']).name for p in photos for v in p['versions']}
for path in public.glob('*.webp'):
    if path.name not in referenced and path.resolve().parent==public.resolve():path.unlink()
collections=[]
for cat,title,description in [('bodas','Bodas','La ceremonia, la celebración y esos gestos que solo ocurren una vez.'),('xv-anos','XV años','Retratos, movimiento y la emoción de celebrar una nueva etapa.'),('retratos','Retratos','Una mirada personal. La expresión, la luz y el carácter de cada sesión.')]:
    items=[p for p in photos if p['category']==cat]
    collections.append(dict(slug=cat,title=title,description=description,total=len(items),cover=items[0],initial=items[:24]))
site=dict(hero=photos[0],collections=collections,total=len(photos),initial=photos[:24])
Path('src/data/site.json').write_text(json.dumps(site,ensure_ascii=False,separators=(',',':')),encoding='utf8')
inventory=json.loads((audit/'inventory.json').read_text(encoding='utf8'))
report=dict(sourceFiles=len(inventory),imageFiles=sum('width'in r for r in inventory),sourceBytes=sum(r['bytes'] for r in inventory),imageBytes=sum(r['bytes'] for r in inventory if 'width'in r),publishedPhotos=len(photos),extractedPhotos=sum(p['sourceRef'] not in {f"{r['id']:03}-00" for r in plan if r['kind']=='single'} for p in photos),candidateRegions=len(allc),duplicateRegions=sum(r['reason']!='low-resolution' for r in duplicates),exactImageDuplicateFiles=sum('duplicateOf' in r for r in inventory if 'width' in r),systemFiles=sum(r['source'].split('/')[-1].startswith('.') or r['extension']=='.uid' for r in inventory),damagedImages=sum('error' in r and not r['source'].split('/')[-1].startswith('.') for r in inventory),lowResolutionRegions=sum(r['reason']=='low-resolution' for r in duplicates),excludedRegions=excluded,productMontagesPublished=0,optimizedBytes=sum(v['bytes'] for p in photos for v in p['versions']),collections=[dict(category=c['slug'],count=c['total']) for c in collections],reviewSourceIds=[r['id'] for r in plan if r['kind']=='review' or r.get('note')],note='Confirmar derechos y consentimientos de publicación, en particular menores. No se publican datos personales ni originales; cajas comerciales pendientes de confirmar procedencia.')
Path('data/photo-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False),flush=True)
