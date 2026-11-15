# Capa no estilo tradicional do canal: papel creme quadriculado, título de caneta vermelha (Caveat), desenho chapado com contorno no meio
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
W, H, S = 1080, 1920, 2
INK = (31, 31, 36); RED = (214, 40, 40); BLUE = (29, 78, 216); GREEN = (21, 128, 61)
im = Image.new('RGB', (W * S, H * S), (251, 245, 223)); d = ImageDraw.Draw(im, 'RGBA')
for x in range(30, W, 54):
    maj = (x - 30) % 216 == 0; d.rectangle((x * S, 0, x * S + (2 if maj else 1) * S - 1, H * S), fill=(70, 130, 200, 66 if maj else 41))
for y in range(30, H, 54):
    maj = (y - 30) % 216 == 0; d.rectangle((0, y * S, W * S, y * S + (2 if maj else 1) * S - 1), fill=(70, 130, 200, 66 if maj else 41))
PAPEL = im.copy()
F = lambda n: ImageFont.truetype('../_papel3d/Caveat-Bold.ttf', n * S)
def texto(t, cy, n, cor, cx=W / 2):
    f = F(n); tw = d.textlength(t, font=f); bb = d.textbbox((0, 0), t, font=f); d.text((cx * S - tw / 2, cy * S - (bb[1] + bb[3]) / 2), t, font=f, fill=cor)
texto('O DIA EM QUE', 300, 118, INK)
texto('OS RIOS FERVERAM', 425, 116, RED)
texto('ninguém sabia que o mundo deles estava vivo...', 545, 54, BLUE)
L = 7 * S  # espessura da caneta
def P(*xy): return [v * S for v in xy]
# quadro do desenho
x0, y0, x1, y1 = 120, 620, 960, 1460
d.rounded_rectangle(P(x0, y0, x1, y1), 18 * S, fill=(244, 170, 160), outline=INK, width=L)
d.rectangle(P(x0 + 4, y0 + 4, x1 - 4, 900), fill=(232, 100, 80))  # céu vermelho de calor
d.rounded_rectangle(P(x0, y0, x1, y1), 18 * S, outline=INK, width=L)
# morros ao fundo
for cx, r in [(260, 170), (560, 210), (860, 160)]: d.pieslice(P(cx - r, 900 - r * 0.6, cx + r, 900 + r * 0.6), 180, 360, fill=(222, 120, 105), outline=INK, width=5 * S)
[im.paste(PAPEL.crop(tuple(b)), tuple(b[:2])) for b in (P(x0 - 60, 600, x0 + 2, 1000), P(x1 - 2, 600, x1 + 80, 1000))]; d.rounded_rectangle(P(x0, y0, x1, y1), 18 * S, outline=INK, width=L)
d.line(P(x0 + 4, 900, x1 - 4, 900), fill=INK, width=5 * S)
# rio fervendo
top = [(x, 960 + 14 * math.sin(x / 55)) for x in range(x0 + 4, x1 - 3, 8)]; bot = [(x, 1060 + 12 * math.sin(x / 60 + 1)) for x in range(x1 - 4, x0 + 3, -8)]
d.polygon([(a * S, b * S) for a, b in top + bot], fill=(196, 28, 40)); d.line([(a * S, b * S) for a, b in top], fill=INK, width=5 * S); d.line([(a * S, b * S) for a, b in bot], fill=INK, width=5 * S)
for bx, by, br in [(200, 1000, 16), (260, 990, 10), (420, 1010, 18), (500, 995, 11), (640, 1005, 15), (720, 990, 9), (850, 1012, 17), (330, 1030, 9)]:
    d.ellipse(P(bx - br, by - br, bx + br, by + br), fill=(255, 110, 90), outline=INK, width=4 * S)
# vapor
for vx, vy, vr in [(300, 920, 34), (330, 870, 26), (620, 930, 38), (660, 860, 28), (860, 915, 30)]:
    d.ellipse(P(vx - vr, vy - vr, vx + vr, vy + vr), fill=(255, 255, 255, 150), outline=(31, 31, 36, 120), width=3 * S)
def olhos(cx, cy, r, bravo=True, dx=0):
    for k in (-1, 1):
        ex = cx + k * r * 0.55; d.ellipse(P(ex - r * 0.36, cy - r * 0.42, ex + r * 0.36, cy + r * 0.42), fill='white', outline=INK, width=4 * S)
        d.ellipse(P(ex - r * 0.17 + dx, cy - r * 0.12, ex + r * 0.17 + dx, cy + r * 0.26), fill=INK)
        d.ellipse(P(ex - r * 0.06 + dx + r * 0.06, cy - r * 0.06, ex + r * 0.04 + dx + r * 0.06, cy + r * 0.04), fill='white')
        if bravo: d.line(P(ex + k * r * 0.4, cy - r * 0.66, ex - k * r * 0.35, cy - r * 0.42), fill=INK, width=6 * S)
# glóbulo branco soldado (esquerda)
gx, gy, gr = 380, 1250, 150
for bx, by, br in [(gx - 130, gy + 30, 55), (gx + 120, gy - 40, 50), (gx - 60, gy + 110, 55)]: d.ellipse(P(bx - br, by - br, bx + br, by + br), fill=(250, 249, 244), outline=INK, width=L)
d.ellipse(P(gx - gr, gy - gr, gx + gr, gy + gr), fill=(250, 249, 244), outline=INK, width=L)
for bx, by, br in [(gx - 130, gy + 30, 55), (gx + 120, gy - 40, 50), (gx - 60, gy + 110, 55)]: d.ellipse(P(bx - br + 6, by - br + 6, bx + br - 6, by + br - 6), fill=(250, 249, 244))
d.pieslice(P(gx - 135, gy - 215, gx + 135, gy - 5), 180, 360, fill=(79, 125, 59), outline=INK, width=L)
d.rounded_rectangle(P(gx - 150, gy - 118, gx + 150, gy - 96), 10 * S, fill=(63, 106, 46), outline=INK, width=5 * S)
olhos(gx + 15, gy - 30, 70, True, dx=8)
d.arc(P(gx - 20, gy + 5, gx + 60, gy + 60), 20, 160, fill=INK, width=6 * S)
# braço dando soco
d.line(P(gx + 120, gy + 20, gx + 245, gy - 10), fill=INK, width=58 * S); d.line(P(gx + 120, gy + 20, gx + 245, gy - 10), fill=(250, 249, 244), width=44 * S)
d.ellipse(P(gx + 225, gy - 50, gx + 300, gy + 25), fill=(250, 249, 244), outline=INK, width=L)
# POW
cx, cy = 640, 1085; pts = [(cx + math.cos(i / 20 * 6.283) * (55 if i % 2 else 120), cy + math.sin(i / 20 * 6.283) * (55 if i % 2 else 110)) for i in range(20)]
d.polygon([(a * S, b * S) for a, b in pts], fill=(255, 225, 74), outline=RED); d.line([(a * S, b * S) for a, b in pts + pts[:1]], fill=RED, width=7 * S)
texto('POW', cy, 70, RED, cx)
# vírus (direita, voando)
vx, vy, vr = 840, 1300, 80
for k in range(14):
    a = k / 14 * 6.283; x1_, y1_ = vx + vr * math.cos(a), vy + vr * math.sin(a); x2_, y2_ = vx + (vr + 40) * math.cos(a), vy + (vr + 40) * math.sin(a)
    d.line(P(x1_, y1_, x2_, y2_), fill=INK, width=12 * S); d.line(P(x1_, y1_, x2_, y2_), fill=(76, 143, 37), width=6 * S)
    d.ellipse(P(x2_ - 13, y2_ - 13, x2_ + 13, y2_ + 13), fill=(214, 48, 74), outline=INK, width=4 * S)
d.ellipse(P(vx - vr, vy - vr, vx + vr, vy + vr), fill=(111, 191, 58), outline=INK, width=L)
olhos(vx, vy - 15, 48, True, dx=-6)
d.ellipse(P(vx - 22, vy + 22, vx + 22, vy + 52), fill=(58, 13, 18), outline=INK, width=4 * S)
# riscos de movimento
for k in range(3): d.line(P(vx - 150 + k * 10, vy - 60 + k * 50, vx - 115 + k * 10, vy - 55 + k * 50), fill=INK, width=5 * S)
texto('o que aconteceu ali dentro?', 1545, 60, INK)
texto('@Cardeno_Amarelo', 1640, 44, (120, 120, 130))
im = im.resize((W, H), Image.LANCZOS); im.save('capa.jpg', quality=92)
