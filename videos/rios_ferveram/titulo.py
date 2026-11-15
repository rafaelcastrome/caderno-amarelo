# Faixa de folha do caderno (amarela, pautada, margem vermelha) com o título em Caveat -> titulo.png (720 px de largura)
from PIL import Image, ImageDraw, ImageFont
W, H = 720, 250
im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle((24, 30, W - 24, H - 10), 18, fill=(0, 0, 0, 70))
d.rounded_rectangle((18, 20, W - 30, H - 20), 18, fill=(255, 233, 120, 255))
for y in range(62, H - 20, 38): d.line((18, y, W - 30, y), fill=(120, 170, 220, 255), width=2)
d.line((70, 20, 70, H - 20), fill=(225, 80, 80, 255), width=3)
f = ImageFont.truetype('../_papel3d/Caveat-Bold.ttf', 74)
for i, lin in enumerate(['O dia em que', 'os rios ferveram']):
    tw = d.textlength(lin, font=f); d.text(((W - tw) / 2 + 20, 22 + i * 92), lin, font=f, fill=(35, 35, 45, 255))
im.save('titulo.png')
