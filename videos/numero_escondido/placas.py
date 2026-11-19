#!/usr/bin/env python3
"""Placas de bolinhas (estilo teste de cores) com número escondido -> placa_N.png."""
import random, math, colorsys
from PIL import Image, ImageDraw, ImageFont
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
S = 900; R = 430
def placa(num, fig, fundo, seed, nome, fs=520):
    rnd = random.Random(seed)
    mask = Image.new("L", (S, S), 0); md = ImageDraw.Draw(mask)
    f = ImageFont.truetype(FONT, fs); bb = md.textbbox((0, 0), num, font=f)
    md.text(((S - (bb[2] - bb[0])) / 2 - bb[0], (S - (bb[3] - bb[1])) / 2 - bb[1]), num, fill=255, font=f)
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = []; grid = {}
    for rr, n in ((22, 3000), (17, 6000), (13, 15000), (10, 30000), (7, 60000), (5, 80000)):
        for _ in range(n):
            r = rr * rnd.uniform(0.85, 1.1)
            x, y = rnd.uniform(0, S), rnd.uniform(0, S)
            if math.hypot(x - S / 2, y - S / 2) + r > R: continue
            gx, gy = int(x // 50), int(y // 50); ok = True
            for i in (gx - 1, gx, gx + 1):
                for j in (gy - 1, gy, gy + 1):
                    for px, py, pr in grid.get((i, j), ()):
                        if math.hypot(x - px, y - py) < r + pr + 2.5: ok = False; break
                    if not ok: break
                if not ok: break
            if ok: pts.append((x, y, r)); grid.setdefault((gx, gy), []).append((x, y, r))
    for x, y, r in pts:
        dentro = mask.getpixel((int(x), int(y))) > 128
        cor = rnd.choice(fig if dentro else fundo)
        d.ellipse([x - r, y - r, x + r, y + r], fill=cor)
    im.save(nome); print(nome, len(pts))
# nível 1: laranja x verde (fácil)
placa("12", [(232, 120, 40), (240, 145, 60), (220, 100, 35), (245, 160, 80)], [(120, 170, 80), (140, 185, 95), (100, 150, 70), (160, 190, 110)], 1, "placa_1.png")
# nível 2: vermelho-rosado x verde-oliva (médio)
placa("57", [(205, 120, 90), (215, 135, 100), (195, 110, 85), (220, 145, 110)], [(150, 160, 95), (165, 170, 105), (140, 150, 90), (175, 175, 115)], 2, "placa_2.png")
# nível 3: bege-alaranjado x bege-esverdeado (difícil)
placa("8", [(205, 160, 115), (212, 168, 120), (198, 152, 110), (215, 172, 128)], [(180, 170, 115), (188, 178, 122), (172, 162, 110), (192, 182, 128)], 3, "placa_3.png", fs=640)
