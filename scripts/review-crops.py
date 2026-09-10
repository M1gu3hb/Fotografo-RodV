"""Recorded visual corrections to automatic proposals, in percent of source dimensions."""
import json
from pathlib import Path

p=Path('private-audit/crop-plan.json')
plan=json.loads(p.read_text(encoding='utf8')); by={r['id']:r for r in plan}
def boxes(i, values, append=False):
    rects=[[v/100 for v in box] for box in values]
    by[i]['crops']=(by[i]['crops'] if append else [])+rects
def grid(i,xs,ys,append=False):
    boxes(i,[(x+.6,y+.8,u-.6,v-.8) for y,v in zip(ys,ys[1:]) for x,u in zip(xs,xs[1:])],append)
def strips(i,xs):grid(i,xs,[0,100])

boxes(27,[(5.7,10,32,49),(5.7,53,32,89),(36,10,63,89),(67,10,94,89)])
boxes(29,[(3,11,48,61),(3,66,25,92),(28,66,48,92),(51,11,72,35),(51,39,72,62),(51,67,72,91),(76,11,95,49),(76,53,95,92)])
strips(37,[0,46,73,100]);strips(38,[0,27.5,50,75,100]);strips(39,[0,29,59,100]);strips(40,[0,29,60,100])
boxes(41,[(51,1,99.4,99)]);boxes(42,[(50,1,99.4,99)])
grid(56,[3.7,26,50,73,97],[9,90])
grid(57,[3.5,27,50,73],[9,90]);boxes(57,[(74,10,96,48),(74,52,96,90)],True)
boxes(58,[(3.8,10,26,90),(27,10,50,90),(51,1,99.4,99)])
grid(59,[3.5,27,50,73],[9,92]);boxes(59,[(74,11,96,49),(74,53,96,91)],True)
grid(60,[3,50,97],[10,91]);grid(61,[4,25,47],[10,46]);boxes(61,[(4,51,47,90),(54,11,95,47),(54,53,95,90)],True)
boxes(62,[(50.5,1,99.5,99)])
grid(81,[5.5,28,48],[9,36,63,91],True)
boxes(86,[(4,9,25,48),(27,9,48,48),(4,51,25,93),(27,51,48,93)]);grid(86,[51,74,97],[9,37,65,94],True)
grid(87,[4.5,35,66,96],[13,53,94])
boxes(89,[(5,12,28,50)],True)
boxes(92,[(28,14,48,37),(5,42,25,64),(28,42,48,64),(52,42,71,64),(28,70,48,92)],True)
boxes(93,[(34,15,49,34),(34,43,49,61)],True)
strips(113,[3.5,50,96.5]);boxes(122,[(51,2,99,98)],True)
boxes(143,[(1.5,5,18,63),(20,5,35,29),(20,33,35,64),(1.5,68,18,95),(20,69,46,95),(77,5,98,95)],True)
boxes(145,[(2,6,19,40),(21,6,43,39),(64,7,81,39),(2,43,21,95),(23,48,38,95),(40,43,56,95)],True)
# The extra contour inside the large left portrait is part of clothing, not a photograph.
by[146]['crops']=[b for b in by[146]['crops'] if (b[2]-b[0])*(b[3]-b[1])>.018]
boxes(147,[(2,8,18,32),(2,37,18,59),(2,64,18,92),(21,67,34,94),(36,65,49,90),(52,7,75,55),(52,62,64,95),(66,62,76,95)],True)
boxes(148,[(2,7,20,34),(23,8,39,34),(3,42,30,92),(34,42,75,91)],True)
boxes(149,[(29,8,44,36),(29,42,44,62),(29,68,44,94)])
by[149]['note']='Fondos fotográficos fusionados y superpuestos: solo se extraen los tres recuadros íntegros; fondos pendientes de original individual.'
boxes(150,[(2,6,20,31),(2,37,20,61),(2,66,20,94),(22,6,36,58),(39,6,52,58),(54,6,76,58),(78,6,98,58),(23,64,52,95),(54,66,80,93)],True)
boxes(151,[(1,38,27,99)],True)
boxes(152,[(2,4,31,54),(2,61,31,96),(33,4,49,96),(52,5,72,36),(52,39,72,66),(52,70,72,96),(75,4,98,47),(75,52,98,96)])
boxes(153,[(6,59,18,90)],True)
boxes(154,[(24,4,44,38),(53,44,77,94)],True)
boxes(155,[(2,5,20,31),(2,35,20,65),(2,70,20,94),(21,5,33,67),(22,73,34,94),(52,5,75,42),(52,46,75,95),(78,5,97,26),(78,29,90,55),(92,29,98,55),(78,59,97,95)],True)
boxes(156,[(27,6,48,49),(2,58,14,95)],True)
by[156]['note']='Retratos de fondo con superposiciones: requieren archivo individual para recuperar encuadre completo.'
boxes(157,[(1,3,24,98),(27,5,50,32)],True)
by[157]['note']='Recuadro inferior derecho con firma y fondo fusionado excluido; requiere original individual.'
boxes(158,[(2,62,32,95)],True)
boxes(159,[(2,4,17,34),(2,39,17,65),(2,69,17,94),(21,16,35,61),(38,47,53,77),(58,9,97,94)],True)
boxes(191,[(4,9,24,32),(26,9,46,34),(4,37,24,63),(26,38,46,64),(4,68,24,93),(26,68,46,93),(48,9,75,46),(48,50,75,92),(78,9,97,32),(78,37,97,62),(78,67,97,92)])
boxes(192,[(4,8,25,36),(28,8,49,36),(51,8,71,36),(28,40,49,66),(4,69,25,94),(28,69,49,94),(52,40,96,94)],True)
grid(193,[4,21],[10,32,53,73,94]);boxes(193,[(22,10,49,57),(22,61,49,94),(52,10,96,66),(52,69,75,94),(77,69,97,94)],True)
grid(194,[4,26,48],[10,38,65,94]);boxes(194,[(52,10,72,35),(75,10,96,35),(52,39,96,94)],True)
boxes(195,[(4,10,24,35),(27,10,49,35),(52,10,72,35),(75,10,96,35),(4,39,49,94)]);grid(195,[52,75,97],[39,67,94],True)
boxes(198,[(52,8,79,93)],True) if len(by[198]['crops'])<8 else None
boxes(233,[(4,8,47,57),(4,61,24,92),(26,61,47,92),(52,8,73,31),(52,37,73,60),(52,66,73,92),(76,8,96,31),(76,37,96,92)])
boxes(234,[(4,8,38,48),(41,8,57,29),(41,33,57,49),(41,53,57,71),(41,75,57,93),(60,8,95,48),(60,53,95,93)],True)
grid(236,[4,26,48,72,96],[9,36,66,94])
boxes(242,[(4,51,38,93)],True) if len(by[242]['crops'])<8 else None
boxes(252,[(30,8,70,48)],True)
strips(266,[0,35,65,100]);strips(267,[0,35,65,100]);strips(300,[0,38,71,100])
boxes(301,[(4,9,26,92),(28,9,49,92),(52,9,76,92),(78,9,96,53),(78,57,96,92)])
strips(302,[0,29,60,100]);strips(303,[0,29,64,100])
boxes(304,[(4,7,30,92),(32,7,49,50),(32,55,49,92),(52,14,73,92),(75,13,96,86)])
strips(305,[0,46,73,100]);strips(306,[0,45,100])
boxes(307,[(4,10,28,92),(30,10,48,60),(30,65,48,92),(52,10,72,92),(74,10,96,92)])
strips(308,[0,27.5,50,75,100]);strips(310,[0,29,59,100])
boxes(312,[(50.5,1,99.5,99)]);boxes(313,[(1,1,32,99)]);boxes(315,[(51,1,99,99)]);strips(316,[0,50,100])
boxes(314,[(26,1,99,83)]);by[314]['kind']='composite'
boxes(317,[(4,7,21,44),(4,48,21,93),(23,7,47,93),(54,7,77,31),(54,34,77,92),(80,7,96,67),(80,71,96,92)])
grid(318,[4,18,32,47],[10,49]);boxes(318,[(4,51,47,94)],True);grid(318,[54,69,83,97],[10,51,94],True)
grid(319,[4,19,32,48],[10,59]);boxes(319,[(4,61,27,93),(29,61,48,93)],True);grid(319,[54,75,97],[10,38,66,94],True)
for r in plan:
    if r['kind']=='review':
        r['note']='Muestra comercial o captura: confirmar procedencia y autorización.' if 255<=r['id']<=299 else 'Portada oscurecida o con texto; variante de fotografía disponible en otra fuente.'
    if r['crops']: r['reviewed']=True
    # Inset another 0.15% to remove antialiasing at the printed frame.
    if r['kind']=='composite':r['crops']=[[round(x+.0015,5),round(y+.0015,5),round(u-.0015,5),round(v-.0015,5)] for x,y,u,v in r['crops']]
Path('scripts/crop-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8')
print('Reviewed',len(plan),'sources;',sum(len(r['crops']) for r in plan),'individual photo regions')
