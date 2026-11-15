# Capa no estilo caderno: folha amarela pautada, título à mão (Caveat), cena do vídeo colada com fita, rabiscos -> capa.jpg 1080x1920
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random
random.seed(4)
W, H, S = 1080, 1920, 2
im = Image.new('RGB', (W * S, H * S), (255, 236, 140)); d = ImageDraw.Draw(im)
for y in range(170 * S, H * S, 62 * S): d.line((0, y, W * S, y), fill=(130, 175, 225), width=3 * S // 2)
d.line((120 * S, 0, 120 * S, H * S), fill=(225, 85, 85), width=4 * S // 2)
for y in range(140, H, 210): d.ellipse(((38) * S, (y) * S, (72) * S, (y + 34) * S), fill=(235, 215, 120))
F = lambda n: ImageFont.truetype('../_papel3d/Caveat-Bold.ttf', n * S)
def texto(t, y, n, cor=(30, 30, 40), cx=W // 2 + 40):
    f = F(n); tw = d.textlength(t, font=f); d.text((cx * S - tw / 2, y * S), t, font=f, fill=cor)
texto('O dia em que', 255, 120)
texto('os rios ferveram', 380, 132, (205, 40, 45))
# sublinhado à mão
pts = [(220 + i * 12, 545 + 6 * math.sin(i * 0.5)) for i in range(60)]
d.line([(x * S, y * S) for x, y in pts], fill=(205, 40, 45), width=7 * S, joint='curve')
# foto da cena colada, levemente torta, com borda branca e fitas
foto = Image.open('prev/cap_guerra.png').convert('RGB')
fw = 760; foto = foto.crop((0, 260, 720, 1000)).resize((fw * S, int(fw * 740 / 720) * S), Image.LANCZOS)
moldura = Image.new('RGB', (foto.width + 36 * S, foto.height + 36 * S), 'white'); moldura.paste(foto, (18 * S, 18 * S))
sombra = Image.new('RGBA', moldura.size, (0, 0, 0, 90)); rot = -3
m2 = moldura.convert('RGBA').rotate(rot, expand=True, resample=Image.BICUBIC); s2 = sombra.rotate(rot, expand=True, resample=Image.BICUBIC).filter(ImageFilter.GaussianBlur(12 * S))
px, py = (W * S - m2.width) // 2 + 30 * S, 620 * S
im.paste(s2, (px + 14 * S, py + 18 * S), s2); im.paste(m2, (px, py), m2)
for (fx, fy, a) in [(px + 60 * S, py - 10 * S, -30), (px + m2.width - 200 * S, py - 4 * S, 25)]:
    fita = Image.new('RGBA', (170 * S, 52 * S), (250, 250, 235, 175)).rotate(a, expand=True, resample=Image.BICUBIC); im.paste(fita, (fx, fy), fita)
d = ImageDraw.Draw(im)
# rabiscos: coração e virusinho à caneta
def coracao(cx, cy, r, cor):
    p = [(cx + r * 16 * math.sin(t) ** 3 / 16, cy - r * (13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) / 16) for t in [i / 60 * 2 * math.pi for i in range(61)]]
    d.line([(x * S, y * S) for x, y in p], fill=cor, width=6 * S)
coracao(905, 1580, 52, (205, 40, 45))
cx, cy = 230, 1585; d.ellipse(((cx - 45) * S, (cy - 45) * S, (cx + 45) * S, (cy + 45) * S), outline=(60, 140, 40), width=6 * S)
for k in range(10):
    a = k / 10 * 2 * math.pi; x1, y1 = cx + 45 * math.cos(a), cy + 45 * math.sin(a); x2, y2 = cx + 72 * math.cos(a), cy + 72 * math.sin(a)
    d.line((x1 * S, y1 * S, x2 * S, y2 * S), fill=(60, 140, 40), width=5 * S); d.ellipse(((x2 - 8) * S, (y2 - 8) * S, (x2 + 8) * S, (y2 + 8) * S), fill=(205, 40, 45))
d.ellipse(((cx - 22) * S, (cy - 14) * S, (cx - 8) * S, (cy + 2) * S), fill=(30, 30, 40)); d.ellipse(((cx + 8) * S, (cy - 14) * S, (cx + 22) * S, (cy + 2) * S), fill=(30, 30, 40))
texto('e ninguém sabia que o mundo', 1660, 72)
texto('deles estava vivo...', 1740, 72)
texto('@Cardeno_Amarelo', 1850, 46, (90, 90, 110))
im = im.resize((W, H), Image.LANCZOS); im.save('capa.jpg', quality=92)
