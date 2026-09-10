"""Final pixel review corrections; coordinates are relative to reviewed rectangles."""
from pathlib import Path
import json
p=Path('scripts/crop-plan.json');plan=json.loads(p.read_text(encoding='utf8'));by={r['id']:r for r in plan}
def refine(key,rect):
    source,index=map(int,key.split('-'));x,y,u,v=by[source]['crops'][index];a,b,c,d=rect
    by[source]['crops'][index]=[x+(u-x)*a,y+(v-y)*b,x+(u-x)*c,y+(v-y)*d]
def split(key,rectangles):
    source,index=map(int,key.split('-'));x,y,u,v=by[source]['crops'][index]
    boxes=[[x+(u-x)*a,y+(v-y)*b,x+(u-x)*c,y+(v-y)*d] for a,b,c,d in rectangles]
    by[source]['crops'][index]=boxes[0];by[source]['crops'].extend(boxes[1:])
split('147-01',[(.02,.035,.98,.44),(.02,.52,.98,.96)])
split('158-04',[(.01,.01,.99,.315),(.01,.345,.99,.64),(.01,.685,.99,.99)])
split('241-06',[(.01,.01,.99,.49),(.01,.56,.99,.99)])
for key,rect in {
 '143-05':(0,.11,1,1),'145-01':(.04,.025,.96,.975),
 '147-02':(0,0,1,.91),'148-05':(0,.06,1,1),'149-00':(0,0,1,.86),
 '155-09':(.01,.28,.98,.98),'155-11':(.01,.27,.98,.98),
 '156-04':(0,0,1,.84),'159-05':(.02,.04,.96,.825),'159-06':(0,0,1,.79),
 '193-00':(0,0,1,.86),'193-01':(0,0,1,.91),
 '314-00':(0,0,1,.89),
 '318-04':(0,0,.92,.95),'318-05':(0,0,.92,.95),'318-06':(0,0,.97,.95),'318-08':(0,0,.94,1)
}.items():refine(key,rect)
excluded={'154-09':'Recuadro duplicado con fragmento vecino; se conserva 154-06.', '158-09':'Región repetida que cruza dos fotos; ambas ya fueron extraídas por separado.', '146-00':'Contorno interior del retrato 146-04, no una foto distinta.'}
Path('scripts/photo-exclusions.json').write_text(json.dumps(excluded,ensure_ascii=False,indent=2),encoding='utf8')
p.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8')
