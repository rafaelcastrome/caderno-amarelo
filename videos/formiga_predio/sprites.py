"""Figuras sombreadas em 3D pro vídeo da formiga caindo do prédio. Gera sprites/*.png uma vez.
Uso: python3 sprites.py
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from base3d import Cena3D, ruido, reduz, pessoa

CORP = (95, 35, 18); PERNA = (70, 28, 15); PERNA_LONGE = (45, 18, 10); OLHO = (20, 10, 8)


def _rot(ox, oy, u, ang, px=0.0, py=0.0):
    """mm -> px, girando 'ang' graus (anti-horário) em volta de (px, py) mm"""
    ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    def P(x, y):
        x, y = x - px, y - py
        x, y = x * ca - y * sa + px, x * sa + y * ca + py
        return (ox + x * u, oy - y * u)
    return P


# ---------------- formiga de lado (andando, sentada, segurando celular) ----------------
def formiga_lado(fase=0.0, ang=0.0, sentada=False, olho_fechado=False, W_=2000, H_=1400):
    c = Cena3D(W_, H_); u = 2000 / 6.0
    P = _rot(W_ / 2, H_ - 1.0 * u, u, ang, -0.5, 0.0)
    # pernas: (base x, joelho, pé) em mm; tripé alternado
    pernas = [(-0.45, (-1.1, 1.9), (-1.6, 0.0)), (0.0, (0.1, 2.0), (0.2, 0.0)), (0.45, (1.2, 1.9), (1.7, 0.0))]
    for i, (bx, k1, k2) in enumerate(pernas):
        for lado, z in ((-1, -60), (1, 400)):
            g = (i + (lado > 0)) % 2                                         # grupo do tripé
            ph = fase * 2 * math.pi + g * math.pi
            dxp = 0.35 * math.sin(ph); lift = max(0, math.cos(ph)) * 0.25
            if sentada:
                dxp = 0; lift = 0
            dx = 0 if lado > 0 else 0.3; s = 1 if lado > 0 else 0.8
            pc = PERNA if lado > 0 else PERNA_LONGE
            if sentada and i == 2:                                           # pernas da frente seguram o celular
                a = P(bx, 1.2); b = P(1.25 + (0.15 if lado < 0 else 0), 0.55); e = P(2.3 + (0.15 if lado < 0 else 0), 1.15)
            elif sentada:
                a = P(bx, 1.2); b = P(bx + (k1[0] - bx) * 1.15, 1.6); e = P(bx + (k2[0] - bx) * 1.4 + 0.4, -0.2)
            else:
                a = P(bx, 1.2); b = P(bx + dx + (k1[0] - bx) * s + dxp * 0.5, k1[1] + (0 if lado > 0 else 0.15) + lift)
                e = P(bx + dx + (k2[0] - bx) * s * 1.1 + dxp, k2[1] + lift)
            c.capsula(*a, *b, 0.11 * u, 0.08 * u, z, pc, 0.5)
            c.capsula(*b, *e, 0.08 * u, 0.045 * u, z, pc, 0.5)
    c.elipse(*P(-1.55, 1.45), 1.05 * u, 0.78 * u, 0.8 * u, 0, CORP, 0.9) if ang == 0 else None
    if ang != 0:                                                             # elipse girada: aproxima com cápsula
        c.capsula(*P(-2.15, 1.45), *P(-0.95, 1.45), 0.7 * u, 0.7 * u, 0, CORP, 0.9)
    c.elipse(*P(-0.55, 1.25), 0.2 * u, 0.28 * u, 0.2 * u, 0, CORP, 0.7)
    c.capsula(*P(-0.35, 1.2), *P(0.65, 1.45), 0.33 * u, 0.38 * u, 0, CORP, 0.8)
    c.elipse(*P(1.3, 1.65), 0.55 * u, 0.5 * u, 0.5 * u, 10, CORP, 0.9)
    if olho_fechado:
        c.capsula(*P(1.38, 1.8), *P(1.62, 1.8), 0.035 * u, 0.035 * u, 0.5 * u + 10, OLHO, 0.3)
    else:
        c.elipse(*P(1.5, 1.8), 0.13 * u, 0.12 * u, 0.1 * u, 0.5 * u + 10, OLHO, 1.2)
    c.capsula(*P(1.75, 1.35), *P(2.05, 1.2), 0.09 * u, 0.04 * u, 30, PERNA, 0.6)
    aw = 0.08 * math.sin(fase * 4 * math.pi)
    c.capsula(*P(1.45, 2.05), *P(1.6, 2.75), 0.05 * u, 0.04 * u, 20, PERNA, 0.5)
    c.capsula(*P(1.6, 2.75), *P(2.3, 2.55 + aw), 0.04 * u, 0.03 * u, 20, PERNA, 0.5)
    tex = 0.85 + 0.3 * ruido(H_, W_, 4, 5, 8)
    return reduz(c.render(tex, amb=0.3, dif=0.9, brilho=50))


# ---------------- formiga vista de cima (caindo, pernas abertas) ----------------
def formiga_cima(abre=1.0, W_=1600, H_=1800):
    c = Cena3D(W_, H_); u = 1600 / 6.0
    P = lambda x, y: (W_ / 2 + x * u, H_ / 2 - y * u)
    for s in (-1, 1):
        for i, (by, ang0) in enumerate([(0.55, 35), (0.25, 0), (-0.05, -35)]):
            ang = math.radians(ang0 * (0.6 + 0.4 * abre))
            l1, l2 = 1.0, 1.25
            kx = s * (0.3 + l1 * math.cos(ang)); ky = by + l1 * math.sin(ang) * 0.9
            bend = math.radians([50, 0, -50][i]) * (0.5 + 0.5 * abre)
            fx = kx + s * l2 * math.cos(ang + bend) * 0.95
            fy = ky + l2 * math.sin(ang + bend) * 0.8
            c.capsula(*P(s * 0.2, by), *P(kx, ky), 0.1 * u, 0.08 * u, 0, PERNA, 0.5)
            c.capsula(*P(kx, ky), *P(fx, fy), 0.08 * u, 0.045 * u, 5, PERNA, 0.5)
    c.elipse(*P(0, -1.35), 0.8 * u, 1.05 * u, 0.75 * u, 0, CORP, 0.9)        # gáster
    c.elipse(*P(0, -0.38), 0.2 * u, 0.22 * u, 0.2 * u, 0, CORP, 0.7)          # pecíolo
    c.capsula(*P(0, -0.15), *P(0, 0.75), 0.3 * u, 0.36 * u, 0, CORP, 0.8)     # tórax
    c.elipse(*P(0, 1.35), 0.55 * u, 0.5 * u, 0.48 * u, 10, CORP, 0.9)         # cabeça
    for s in (-1, 1):
        c.elipse(*P(s * 0.42, 1.45), 0.12 * u, 0.15 * u, 0.1 * u, 0.3 * u, OLHO, 1.2)
        c.capsula(*P(s * 0.2, 1.75), *P(s * 0.55, 2.35), 0.05 * u, 0.04 * u, 20, PERNA, 0.5)
        c.capsula(*P(s * 0.55, 2.35), *P(s * 0.25, 2.85), 0.04 * u, 0.03 * u, 20, PERNA, 0.5)
        c.capsula(*P(s * 0.15, 1.82), *P(s * 0.05, 2.02), 0.08 * u, 0.04 * u, 15, PERNA, 0.6)   # mandíbula
    tex = 0.85 + 0.3 * ruido(H_, W_, 7, 5, 8)
    return reduz(c.render(tex, amb=0.3, dif=0.9, brilho=50))


# ---------------- fachada do prédio (50 andares) ----------------
ANDAR = 150          # px por andar na fachada de perto


def fachada(andares=52, w=520):
    h = andares * ANDAR
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    concreto = np.array([196, 190, 180], np.float32) / 255
    img = np.ones((h, w, 3), np.float32) * concreto
    img *= (0.9 + 0.15 * ruido(h // 8 + 1, w // 8 + 1, 3, 4, 4).repeat(8, 0).repeat(8, 1)[:h, :w, None])
    # sombra lateral (luz vem da esquerda)
    img *= (1.02 - 0.18 * (X / w))[..., None]
    jan_w, mx = 118, 26
    cols = [mx + k * (jan_w + 30) for k in range(3)]
    yy = Y % ANDAR
    for x0 in cols:
        m = (X >= x0) & (X < x0 + jan_w) & (yy >= 28) & (yy < ANDAR - 26)
        ref = 0.55 + 0.35 * np.sin((X - x0) / jan_w * 2.2 + Y / 900.0) * 0.5 + 0.25 * ((yy - 28) / (ANDAR - 54))
        vidro = np.dstack([0.35 + 0.25 * ref, 0.52 + 0.25 * ref, 0.62 + 0.25 * ref])
        img[m] = vidro[m]
        # moldura / sombra do parapeito
        mb = (X >= x0 - 4) & (X < x0 + jan_w + 4) & (yy >= ANDAR - 26) & (yy < ANDAR - 18)
        img[mb] = img[mb] * 0.55
        mt = (X >= x0) & (X < x0 + jan_w) & (yy >= 28) & (yy < 36)
        img[mt] = img[mt] * 0.6
    # linha de laje
    ml = (yy < 6); img[ml] *= 0.78
    rgb = np.clip(img * 255, 0, 255).astype(np.uint8)
    im = Image.fromarray(rgb)
    d = ImageDraw.Draw(im)
    d.line([(w - 3, 0), (w - 3, h)], fill=(70, 70, 70), width=5)
    d.line([(1, 0), (1, h)], fill=(70, 70, 70), width=3)
    return im


def predio_inteiro(hpx=1500, w=170):
    """prédio todo, visto de longe (50 andares)"""
    im = Image.new('RGBA', (w + 60, hpx + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = fachada(50, 520).resize((w, hpx), Image.LANCZOS)
    lado = Image.fromarray((np.asarray(f).astype(np.float32) * 0.62).astype(np.uint8)).resize((50, hpx))
    im.paste(f, (0, 40)); im.paste(lado, (w, 40))
    d.polygon([(0, 40), (w, 40), (w + 50, 20), (50, 20)], fill=(150, 146, 140), outline=(70, 70, 70))
    d.rectangle([w * 0.3, 0, w * 0.3 + 6, 30], fill=(90, 90, 90))
    d.rectangle([0, 40, w, hpx + 40], outline=(60, 60, 60), width=3)
    return im


def chao(w=1080, h=520):
    """calçada com piso + meio-fio, vista de lado/perspectiva"""
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    base = np.array([168, 164, 158], np.float32) / 255
    img = np.ones((h, w, 3), np.float32) * base
    img *= (0.85 + 0.25 * ruido(h, w, 11, 6, 12))[..., None]
    # placas de concreto em perspectiva
    yy = Y / h
    for k in range(1, 8):
        yl = (k / 8) ** 1.6
        m = np.abs(yy - yl) < 0.004 + 0.002 * k / 8
        img[m] *= 0.6
    xc = (X - w / 2) / (0.35 + yy * 0.65)
    m = (np.abs((xc + 5000) % 300 - 150) > 147); img[m] *= 0.65
    img[(Y < 14)] *= 0.75
    rgb = np.clip(img * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(rgb)


def arvore(h=900):
    """tronco de árvore da Amazônia (inset da formiga planadora)"""
    w = 300
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = w / 2 + 12 * np.sin(Y / 160)
    r = 95 + 8 * np.sin(Y / 70)
    q = (X - cx) / r; m = np.abs(q) < 1
    nz = np.sqrt(np.clip(1 - q ** 2, 0, 1))
    luz = 0.35 + 0.7 * np.clip(nz * 0.8 - q * 0.45, 0, 1)
    sulco = 0.75 + 0.35 * ruido(h, w, 21, 6, 3)
    sulco *= 0.8 + 0.25 * (np.sin(X * 0.25 + 3 * ruido(h, w, 22, 4, 4) * 6) > 0)
    cor = np.array([110, 78, 52], np.float32) / 255
    img = cor[None, None] * (luz * sulco)[..., None]
    rgba = np.zeros((h, w, 4), np.uint8); rgba[..., :3] = np.clip(img * 255, 0, 255); rgba[..., 3] = m * 255
    return Image.fromarray(rgba)


if __name__ == '__main__':
    os.makedirs('sprites', exist_ok=True)
    for k in range(8):
        formiga_lado(k / 8).save(f'sprites/anda{k}.png')
    formiga_lado(0, sentada=True).save('sprites/sentada.png')
    formiga_lado(0, ang=180, olho_fechado=True).save('sprites/de_costas.png')
    formiga_lado(0, ang=-60).save('sprites/tombando.png')
    for k, a in enumerate([1.0, 0.7]):
        formiga_cima(a).save(f'sprites/cima{k}.png')
    fachada().save('sprites/fachada.png')
    predio_inteiro().save('sprites/predio.png')
    chao().save('sprites/chao.png')
    arvore().save('sprites/arvore.png')
    p = pessoa(); p.save('sprites/pessoa.png')
    print('ok')
