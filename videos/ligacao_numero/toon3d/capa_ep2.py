# Capa do episódio 2: motorista com a tua cara + título.
import json, subprocess
from PIL import Image, ImageDraw, ImageFont
ev = json.load(open('tl_ep2.json'))['ev']
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ev['g1']['t'] + 0.6), '-i', 'ep2.mp4', '-frames:v', '1', 'q.png'], check=True)
W, H = 1080, 1920
im = Image.open('q.png').convert('RGB').resize((W, H), Image.LANCZOS); d = ImageDraw.Draw(im, 'RGBA')
d.rectangle([0, 0, W, 560], fill=(0, 0, 0, 150))
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
def c(t, y, s, cor): w = d.textlength(t, font=F(s)); d.text(((W - w) / 2, y), t, font=F(s), fill=cor, stroke_width=6, stroke_fill=(0, 0, 0))
c('O MOTORISTA', 150, 100, (255, 255, 255)); c('TINHA A', 265, 100, (255, 255, 255)); c('MINHA CARA', 380, 100, (235, 60, 60))
d.rounded_rectangle([370, 50, 710, 125], 20, fill=(255, 214, 90)); w = d.textlength('PARTE 2', font=F(52)); d.text(((W - w) / 2, 58), 'PARTE 2', font=F(52), fill=(20, 20, 20))
im.save('capa_ep2.jpg', quality=92)
