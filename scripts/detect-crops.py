"""Propose rectangles for visual review; never publishes candidates."""
from pathlib import Path
import json, sys
import cv2
import numpy as np
from PIL import Image, ImageOps, ImageDraw

root=Path(sys.argv[1]); out=Path('private-audit')
records=json.loads((out/'inventory.json').read_text(encoding='utf8'))
singles=set(range(1,27))|{0,28,30,31,32,33,34,35,36,43,44,111,112,144,260,261,262,263,264,265,271,272,273,320,321,322,323}
excluded=set(range(255,260))|set(range(288,300))|{95,96,160,205,206,253,254,311,314}
plan=[]; thumbs=[]
for r in records:
    if 'width' not in r: continue
    ident=r['id']
    category='xv-anos' if ident in {1,4,6,7,16,33,34,35,144,314} or 143<=ident<=160 or 232<=ident<=254 else 'retratos' if ident in {17,42,300,303,306,309} else 'bodas'
    item=dict(id=ident,source=r['source'],category=category,kind='single' if ident in singles else 'review' if ident in excluded else 'composite',crops=[])
    if ident in singles: item['crops']=[[0,0,1,1]] if ident!=0 else [[.075,.123,.917,.846]]
    elif ident not in excluded:
        with Image.open(root/r['source']) as src: im=ImageOps.exif_transpose(src).convert('RGB'); im.thumbnail((1600,1000))
        a=np.array(im); gray=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
        edge=cv2.Canny(gray,40,120)
        contours,_=cv2.findContours(edge,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
        boxes=[]
        for c in contours:
            peri=cv2.arcLength(c,True); approx=cv2.approxPolyDP(c,peri*.018,True)
            if len(approx)!=4: continue
            x,y,w,h=cv2.boundingRect(approx); area=w*h
            if .009*a.shape[0]*a.shape[1]<area<.93*a.shape[0]*a.shape[1] and w>65 and h>65 and cv2.contourArea(approx)/area>.94:
                boxes.append((x,y,w,h))
        chosen=[]
        for b in sorted(boxes,key=lambda b:b[2]*b[3],reverse=True):
            x,y,w,h=b
            if any(max(0,min(x+w,u+ww)-max(x,u))*max(0,min(y+h,v+hh)-max(y,v))>.7*w*h for u,v,ww,hh in chosen):continue
            chosen.append(b)
        for x,y,w,h in sorted(chosen,key=lambda b:(round(b[1]/30),b[0])):
            item['crops'].append([round((x+5)/im.width,5),round((y+5)/im.height,5),round((x+w-5)/im.width,5),round((y+h-5)/im.height,5)])
        im.thumbnail((390,220)); draw=ImageDraw.Draw(im)
        for j,(x,y,u,v) in enumerate(item['crops']):
            draw.rectangle((x*im.width,y*im.height,u*im.width,v*im.height),outline='#00ff44',width=2);draw.text((x*im.width+3,y*im.height+3),str(j),fill='#00ff44')
        thumbs.append((item,im))
    plan.append(item)
for offset in range(0,len(thumbs),15):
    sheet=Image.new('RGB',(1200,1250),'#ddd'); draw=ImageDraw.Draw(sheet)
    for j,(r,im) in enumerate(thumbs[offset:offset+15]):
        x=j%3*400;y=j//3*250;sheet.paste(im,(x,y));draw.text((x+5,y+225),f"{r['id']} | {len(r['crops'])} crops | {r['source'][:38]}",fill='black')
    sheet.save(out/f'proposals-{offset//15:02}.jpg',quality=92)
(out/'crop-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8')
print('Proposed',sum(len(r['crops']) for r in plan),'crops in',len(thumbs),'composites')
