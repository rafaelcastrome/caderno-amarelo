# Cartão de CTA no fim (folha do caderno + botão de seguir genérico) -> cta.png
from PIL import Image, ImageDraw, ImageFont
W, H = 720, 330
im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle((46, 18, W - 40, H - 12), 22, fill=(0, 0, 0, 80))
d.rounded_rectangle((40, 10, W - 46, H - 20), 22, fill=(255, 233, 120, 245))
for y in range(54, H - 20, 40): d.line((40, y, W - 46, y), fill=(120, 170, 220, 255), width=2)
d.line((92, 10, 92, H - 20), fill=(225, 80, 80, 255), width=3)
f = ImageFont.truetype('../_papel3d/Caveat-Bold.ttf', 54); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
for i, lin in enumerate(['Quer ouvir mais histórias', 'como essa?']):
    tw = d.textlength(lin, font=f); d.text(((W - tw) / 2 + 14, 14 + i * 58), lin, font=f, fill=(35, 35, 45, 255))
# botão "Seguir" com ícone de pessoa +
bx0, by0, bx1, by1 = 120, 150, W - 126, 228
d.rounded_rectangle((bx0, by0, bx1, by1), 39, fill=(0, 149, 246, 255))
cx, cy = bx0 + 48, (by0 + by1) // 2
d.ellipse((cx - 13, cy - 26, cx + 13, cy), fill='white'); d.pieslice((cx - 24, cy + 2, cx + 24, cy + 46), 180, 360, fill='white')
d.rectangle((cx + 26, cy - 3, cx + 46, cy + 3), fill='white'); d.rectangle((cx + 33, cy - 10, cx + 39, cy + 10), fill='white')
t = 'Seguir'; tw = d.textlength(t, font=f2); d.text(((bx0 + bx1) / 2 - tw / 2 + 28, cy - 21), t, font=f2, fill='white')
t = '@Cardeno_Amarelo'; tw = d.textlength(t, font=f); d.text(((W - tw) / 2 + 14, 236), t, font=f, fill=(35, 35, 45, 255))
im.save('cta.png')
