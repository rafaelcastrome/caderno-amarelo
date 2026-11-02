"""Cena dos passes: 4 bonequinhos passam a bola; um dinossauro atravessa devagar
e a folha muda de cor aos poucos (cegueira por desatenção + cegueira à mudança)."""
import math
import numpy as np
from PIL import Image, ImageDraw

W, H = 1080, 1920
INK = (30, 30, 30)
BOLA = (235, 90, 20)
PAPEL0 = np.array((251, 245, 223), float)    # amarelinho
PAPEL1 = np.array((222, 238, 252), float)    # azulzinho
CAMISAS = [(245, 197, 24), (53, 103, 160), (245, 197, 24), (53, 103, 160)]
POS = [(540, 700), (230, 990), (850, 990), (540, 1290)]   # pés de cada boneco (y = chão)
CONTA = 14.0                                   # duração da contagem (s)
PASSES = [(0, 1), (1, 3), (3, 2), (2, 0), (0, 3), (3, 1), (1, 2), (2, 3), (3, 0), (0, 2), (2, 1), (1, 0), (0, 3)]
N = len(PASSES)                                # 13


def papel(k):
    c = tuple(int(v) for v in PAPEL0 + (PAPEL1 - PAPEL0) * k)
    im = Image.new('RGB', (W, H), c); d = ImageDraw.Draw(im)
    lin = tuple(int(v * 0.86) for v in c); lin2 = tuple(int(v * 0.80) for v in c)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=lin if (x - 30) % 216 else lin2, width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=lin if (y - 30) % 216 else lin2, width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


def mao(i):
    x, y = POS[i]; return (x + (40 if x < 540 else -40 if x > 540 else 0), y - 190)


def bola_pos(t):
    """(x, y, passe atual) em t dentro da contagem"""
    dur = CONTA / N
    j = min(N - 1, int(t / dur)); u = (t - j * dur) / dur
    a, b = PASSES[j]
    # segura 30% do tempo, voa 70%
    if u < 0.3:
        x, y = mao(a); return x, y + 6 * math.sin(u * 20), j, a
    v = (u - 0.3) / 0.7; v = v * v * (3 - 2 * v)
    (x0, y0), (x1, y1) = mao(a), mao(b)
    arco = -120 if (j % 3) else 0              # alguns passes por cima, outros retos
    return x0 + (x1 - x0) * v, y0 + (y1 - y0) * v + arco * 4 * v * (1 - v), j, None


def boneco(d, S, i, t, segurando):
    x, y = POS[i]; s = lambda *v: [c * S for c in v]
    pul = 8 * abs(math.sin(t * 5 + i))
    y = y - pul
    lw = 9 * S
    # pernas
    d.line(s(x, y - 110, x - 35, y), fill=INK, width=lw); d.line(s(x, y - 110, x + 35, y), fill=INK, width=lw)
    # camisa (tronco)
    d.rounded_rectangle(s(x - 42, y - 230, x + 42, y - 100), 18 * S, fill=CAMISAS[i], outline=INK, width=6 * S)
    # braços: pra cima quando segura a bola
    mx, my = mao(i); my -= pul
    if segurando:
        d.line(s(x - 30, y - 210, mx - 18, my + 10), fill=INK, width=lw); d.line(s(x + 30, y - 210, mx + 18, my + 10), fill=INK, width=lw)
    else:
        d.line(s(x - 38, y - 210, x - 75, y - 140), fill=INK, width=lw); d.line(s(x + 38, y - 210, x + 75, y - 140), fill=INK, width=lw)
    # cabeça
    d.ellipse(s(x - 38, y - 310, x + 38, y - 234), fill=(255, 255, 255), outline=INK, width=6 * S)
    d.ellipse(s(x - 16, y - 282, x - 8, y - 270), fill=INK); d.ellipse(s(x + 8, y - 282, x + 16, y - 270), fill=INK)
    d.arc(s(x - 16, y - 275, x + 16, y - 250), 20, 160, fill=INK, width=4 * S)


DINO_IN, DINO_OUT = 3.0, 12.5                   # entra/sai (s da contagem)


def dino_x(t):
    """atravessa da direita pra esquerda, para no meio e acena"""
    a, b = DINO_IN, DINO_OUT
    if t < a or t > b: return None
    u = (t - a) / (b - a)
    if u < 0.4: return 1300 - (1300 - 560) * (u / 0.4)
    if u < 0.6: return 560
    return 560 - (560 + 260) * ((u - 0.6) / 0.4)


def dino(d, S, cx, t, parado):
    """T-rex de caderno, cinza claro (mesma tinta dos bonecos)"""
    s = lambda *v: [c * S for c in v]
    cy = 1100 - 10 * abs(math.sin(t * 6)) * (0 if parado else 1)
    F = (205, 205, 200); lw = 7 * S
    def P(pts): return [(cx + px) * S if k % 2 == 0 else (cy + px) * S for k, px in enumerate(pts)]
    # rabo
    d.polygon([((cx + 120) * S, (cy - 120) * S), ((cx + 300) * S, (cy - 60) * S), ((cx + 110) * S, (cy - 40) * S)], fill=F, outline=INK, width=lw)
    # pernas
    fase = 0 if parado else math.sin(t * 6) * 25
    for dx, ph in ((-40, fase), (50, -fase)):
        d.rounded_rectangle(s(cx + dx - 28 + ph * 0.3, cy - 80, cx + dx + 28 + ph * 0.3, cy + 40), 14 * S, fill=F, outline=INK, width=lw)
    # corpo
    d.ellipse(s(cx - 120, cy - 260, cx + 150, cy - 30), fill=F, outline=INK, width=lw)
    # pescoço + cabeça
    d.ellipse(s(cx - 170, cy - 390, cx + 10, cy - 250), fill=F, outline=INK, width=lw)
    d.rectangle(s(cx - 110, cy - 270, cx - 10, cy - 200), fill=F)
    d.ellipse(s(cx - 120, cy - 350, cx - 96, cy - 326), fill=INK)        # olho
    d.line(s(cx - 165, cy - 300, cx - 70, cy - 290), fill=INK, width=5 * S)  # boca
    for k in range(4):
        x0 = cx - 160 + k * 22; d.polygon(s(x0, cy - 299, x0 + 9, cy - 285, x0 + 18, cy - 298), fill=(255, 255, 255))
    # bracinho (acena quando parado)
    ang = math.sin(t * 14) * 0.6 if parado else 0.3
    bx, by = cx - 90, cy - 190
    d.line(s(bx, by, bx - 60 * math.cos(ang), by - 60 * math.sin(ang) - 20), fill=INK, width=8 * S)
    # pintinhas nas costas
    for k in range(4):
        x0 = cx - 20 + k * 40; d.polygon(s(x0, cy - 250 + k * 8, x0 + 20, cy - 290 + k * 8, x0 + 40, cy - 245 + k * 8), fill=F, outline=INK, width=4 * S)


def quadro(t, cor_k=None, circula=False):
    """quadro da contagem no tempo t (0..CONTA)"""
    k = min(1, max(0, t / CONTA)) if cor_k is None else cor_k
    im = papel(k)
    S = 2
    lay = Image.new('RGBA', (W * S, (1350 - 360) * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    # desloca o desenho: y 360..1350 do quadro
    class D2:
        def __getattr__(self, n):
            f = getattr(d, n)
            def g(xy, *a, **kw):
                if isinstance(xy, list) and xy and not isinstance(xy[0], tuple):
                    xy = [v - (360 * S if i % 2 else 0) for i, v in enumerate(xy)]
                elif isinstance(xy, list):
                    xy = [(px, py - 360 * S) for px, py in xy]
                return f(xy, *a, **kw)
            return g
    dd = D2()
    dx = dino_x(t)
    if dx is not None:
        u = (t - DINO_IN) / (DINO_OUT - DINO_IN)
        dino(dd, S, dx, t, 0.4 <= u < 0.6)
    bx, by, j, seg = bola_pos(min(t, CONTA - 1e-3))
    for i in range(4):
        boneco(dd, S, i, t, seg == i)
    r = 26
    dd.ellipse([(bx - r) * S, (by - r) * S, (bx + r) * S, (by + r) * S], fill=BOLA, outline=INK, width=5 * S)
    lay = lay.resize((W, 1350 - 360), Image.LANCZOS)
    im.paste(lay, (0, 360), lay)
    if circula and dx is not None:
        d0 = ImageDraw.Draw(im); cy = 930
        d0.ellipse([dx - 260, cy - 260, dx + 300, cy + 260], outline=(214, 40, 40), width=12)
    return im


if __name__ == '__main__':
    for t in (0.5, 5, 8, 11):
        quadro(t).resize((540, 960)).save(f't_{t}.png')
