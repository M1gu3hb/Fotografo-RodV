"""Verify transformed duplicates with local features and aligned pixel correlation."""
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import cv2
import numpy as np

audit=Path('private-audit');items=json.loads((audit/'candidates.json').read_text(encoding='utf8'))
def features(c):
    im=cv2.imread(str(audit/'candidates'/f"{c['id']}.jpg"),cv2.IMREAD_GRAYSCALE)
    keypoints,descriptors=cv2.SIFT_create(nfeatures=450).detectAndCompute(im,None)
    return c['id'],(im,np.float32([k.pt for k in keypoints]),descriptors)
with ThreadPoolExecutor(max_workers=4) as pool:prepared=dict(pool.map(features,items))
items.sort(key=lambda c:(c['kind']=='single',c['pixels']),reverse=True)
duplicate={}; pairs=[]
for i,c in enumerate(items):
    for k in items[:i]:
        if c['category']!=k['category']:continue
        pd=(int(c['phash'])^int(k['phash'])).bit_count();dd=(int(c['dhash'])^int(k['dhash'])).bit_count()
        if pd<=24 or dd<=20:pairs.append((c,k))
def compare(pair):
    c,k=pair;a,ap,ad=prepared[c['id']];b,bp,bd=prepared[k['id']]
    if ad is None or bd is None or len(ad)<15 or len(bd)<15:return None
    matches=cv2.BFMatcher().knnMatch(ad,bd,k=2)
    good=[m for m,n in matches if m.distance<.68*n.distance]
    if len(good)<16:return None
    src=np.float32([ap[m.queryIdx] for m in good]);dst=np.float32([bp[m.trainIdx] for m in good])
    h,mask=cv2.findHomography(src,dst,cv2.RANSAC,2.5)
    if h is None or mask.sum()<14 or mask.sum()/len(good)<.65:return None
    warped=cv2.warpPerspective(a,h,(b.shape[1],b.shape[0]))
    coverage=cv2.warpPerspective(np.full(a.shape,255,dtype=np.uint8),h,(b.shape[1],b.shape[0]))>250
    coverage=cv2.erode(coverage.astype('uint8'),np.ones((5,5),np.uint8)).astype(bool)
    if coverage.sum()<min(a.size,b.size)*.42:return None
    av=warped[coverage].astype(float);bv=b[coverage].astype(float)
    correlation=float(np.corrcoef(av,bv)[0,1])
    if correlation>.975:
        return c['id'],k['id'],round(correlation,5)
    return None
print('Comparing',len(pairs),'candidate pairs',flush=True)
with ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(compare,pairs):
        if result:
            c,k,score=result
            if c not in duplicate:duplicate[c]=dict(duplicateOf=k,correlation=score)
Path('scripts/visual-duplicates.json').write_text(json.dumps(duplicate,indent=2),encoding='utf8')
print('Confirmed transformed duplicates:',len(duplicate),flush=True)
