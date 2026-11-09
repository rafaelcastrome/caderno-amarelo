# Stories anunciando o episódio 2 + resultado da votação (NÃO ENTRAR ganhou).
import subprocess, numpy as np, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.2', '-i', 'rua.mp4', '-frames:v', '1', 'ultimo.png'], check=True)
W, H = 1080, 1920
im = Image.open('ultimo.png').convert('RGB').resize((W, H), Image.LANCZOS)
# escurece em cima (texto) com degradê, mantém o celular "EU" visível embaixo
a = np.array(im).astype(np.float32); y = np.linspace(0, 1, H)[:, None, None]
k = np.clip(1 - (y - 0.15) / 0.4, 0, 1) * 0.78 + 0.12
a = a * (1 - k) + np.array([8, 10, 18]) * k
im = Image.fromarray(a.clip(0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; F = lambda s: ImageFont.truetype(FB, s)
def c(txt, yy, s, cor, sw=5):
    w = d.textlength(txt, font=F(s)); d.text(((W - w) / 2, yy), txt, font=F(s), fill=cor, stroke_width=sw, stroke_fill=(0, 0, 0))
c('LIGAÇÃO DO TEU PRÓPRIO NÚMERO', 150, 40, (210, 210, 220), 3)
c('EPISÓDIO 2', 225, 120, (255, 255, 255), 6)
c('SAI JÁ JÁ...', 370, 78, (255, 214, 90), 5)
c('VOCÊS ESCOLHERAM:', 560, 52, (235, 235, 235), 4)
x0, x1, y0, y1 = 150, W - 150, 645, 805
d.rounded_rectangle([x0 + 8, y0 + 10, x1 + 8, y1 + 10], 40, fill=(0, 0, 0))
d.rounded_rectangle([x0, y0, x1, y1], 40, fill=(225, 55, 55), outline=(255, 255, 255), width=6)
w = d.textlength('NÃO ENTRAR', font=F(92)); d.text(((W - w) / 2, y0 + 30), 'NÃO ENTRAR', font=F(92), fill=(255, 255, 255))
c('a maioria mandou NÃO subir no ônibus', 840, 40, (235, 235, 235), 3)
c('...e agora vocês vão ver o que aconteceu', 892, 40, (235, 235, 235), 3)
im.save('stories_ep2.jpg', quality=93); print('ok')
