"""Build a branded social preview from a real, uncropped published photograph."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
site=json.loads(Path('src/data/site.json').read_text(encoding='utf8'))
photo=Image.open('public'+site['hero']['versions'][-1]['src']).convert('RGB');photo.thumbnail((510,600))
canvas=Image.new('RGB',(1200,630),'white');canvas.paste(photo,(675+(510-photo.width)//2,(630-photo.height)//2))
draw=ImageDraw.Draw(canvas)
serif=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',87)
sans=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
draw.line((58,60,615,60),fill='#aaaaaa',width=1)
draw.text((58,185),'The best',font=sans,fill='#111111')
draw.text((53,222),'Moment',font=serif,fill='#111111')
draw.text((58,360),'FOTOGRAFÍA POR RODRIGO VARGAS',font=sans,fill='#555555')
draw.text((58,545),'BODAS  /  XV AÑOS  /  RETRATOS',font=sans,fill='#555555')
canvas.save('public/brand/social.jpg',quality=94,subsampling=0)
