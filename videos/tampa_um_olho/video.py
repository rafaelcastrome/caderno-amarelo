"""Tampa um olho: lápis e bolinhas em 3D de verdade (projeção em perspectiva) no papel do caderno.
Uso: python video.py            -> narracao.wav + tampa_um_olho.mp4
     python video.py 1.0 9.5    -> prev_1.0.png, prev_9.5.png
"""
import numpy as np, subprocess, math, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W, H, FPS = 1080, 1920, 30
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70); PINK = (200, 70, 200)
YEL = (245, 197, 24)
# (ini, fim no take, posição no vídeo)
FALAS = [(0.00, 4.30, 0.3), (4.75, 7.50, 4.6), (7.80, 10.50, 8.4), (11.25, 14.40, 12.8),
         (15.05, 18.75, 18.6), (19.25, 22.30, 22.2), (22.65, 26.40, 25.0), (26.85, 32.70, 28.6)]
DUR = 34.4
P_INI, P_FIM = 4.5, 12.6      # lápis
B_INI, B_FIM = 12.4, 22.0     # bolinhas
EXP = 22.0                    # explicação
FINAL = 28.4


def paper():
    im = Image.new('RGB', (W, H), (251, 245, 223)); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


BASE = paper()


def txt(s, size, fill):
    f = F(size); l, t, r, b = f.getbbox(s); im = Image.new('RGBA', (r - l + 32, b - t + 42), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10 - l, 10 - t), s, font=f, fill=fill, stroke_width=6, stroke_fill=(251, 245, 223)); return im


# ---------- arte desenhada em 2x (antisserrilhado) e reduzida ----------
S2 = 2
FOC = 1000.0; CX, CY = 540, 1000
LUZ = np.array([-0.5, 0.65, -0.58]); LUZ /= np.linalg.norm(LUZ)


def ease(u): u = min(1, max(0, u)); return u * u * (3 - 2 * u)


def norm(v): return v / np.linalg.norm(v)


def proj2(p):  # coordenadas na tela 2x
    return (S2 * (CX + FOC * p[0] / p[2]), S2 * (CY - FOC * p[1] / p[2]))


def tom(cor, n, spec=0.0):
    lam = max(0.0, float(np.dot(n, LUZ)))
    k = 0.62 + 0.48 * lam
    v = [min(255, c * k) for c in cor]
    if spec:
        h = norm(LUZ + np.array([0, 0, -1.0]))
        sp = max(0.0, float(np.dot(n, h))) ** 30 * spec
        v = [min(255, c + 255 * sp) for c in v]
    return tuple(int(c) for c in v)


# lápis: (x ao longo do eixo a partir da ponta, raio, nº de lados, cor, brilho)
R = 0.55
SEC = [(0.00, 0.00, 6, (55, 55, 62), 0.6), (0.45, 0.17, 6, (236, 200, 150), 0.0), (1.75, R, 6, YEL, 0.35),
       (9.30, R * 1.02, 16, (196, 198, 204), 0.9), (9.55, R * 1.02, 16, (150, 152, 160), 0.6), (9.70, R * 1.02, 16, (200, 202, 208), 0.9),
       (10.05, R * 1.02, 16, (150, 152, 160), 0.6), (10.20, R * 1.02, 16, (198, 200, 206), 0.9),
       (10.55, R * 0.98, 16, (236, 118, 132), 0.15), (11.30, R * 0.98, 16, None, 0)]


def ring(tip, a, b, c, x, r, n, giro):
    return [tip + x * a + r * (math.cos(giro + k * 2 * math.pi / n) * b + math.sin(giro + k * 2 * math.pi / n) * c) for k in range(n)]


def lapis_faces(tip, eixo, giro):
    a = norm(eixo); b = norm(np.cross([0, 1, 0], a)); c = np.cross(a, b)
    faces = []
    for i in range(len(SEC) - 1):
        x0, r0, n0, cor, sp = SEC[i]; x1, r1, n1, _, _ = SEC[i + 1]
        n = max(n0, n1) if i > 1 else 6
        if cor is None: continue
        # o hexágono do corpo e o cone usam 6 lados alinhados; ponteira/borracha usam 16
        nn = 16 if i >= 3 else 6
        p0 = ring(tip, a, b, c, x0, r0, nn, giro); p1 = ring(tip, a, b, c, x1, r1, nn, giro)
        mid = tip + a * (x0 + x1) / 2
        for k in range(nn):
            q = [p0[k], p0[(k + 1) % nn], p1[(k + 1) % nn], p1[k]] if r0 > 0 else [p0[0], p1[(k + 1) % nn], p1[k]]
            cen = sum(q) / len(q)
            nv = norm(np.cross(q[1] - q[0], q[-1] - q[0]) if r0 > 0 else np.cross(q[1] - q[0], q[2] - q[0]))
            radial = cen - mid - a * np.dot(cen - mid, a)
            if np.dot(nv, radial) < 0: nv = -nv
            cc = cor
            if cor == YEL and k % 2: cc = (236, 178, 12)
            faces.append((q, nv, cc, sp, i))
    # tampa da borracha (disco levemente abaulado)
    pb = ring(tip, a, b, c, 11.30, R * 0.98, 16, giro)
    faces.append((pb, a, (226, 108, 124), 0.1, 99))
    out = []
    for q, nv, cor, sp, i in faces:
        cen = sum(q) / len(q)
        if np.dot(nv, cen) >= 0: continue
        out.append((float(np.linalg.norm(cen)), [proj2(p) for p in q], tom(cor, nv, sp), i))
    out.sort(key=lambda f: -f[0])
    return out


def lapis_estado(t):
    u = t - P_INI
    if u < 3.2: z = 50 - 40 * ease(u / 3.2)
    elif u < 4.0: z = 10 + 0.8 * math.sin((u - 3.2) * 7)
    elif u < 6.5: z = 10 - 7.6 * ease((u - 4.0) / 2.5)
    elif u < 7.2: z = 2.4 + 0.1 * math.sin((u - 6.5) * 30)
    else: z = 2.4 + 60 * ease((u - 7.2) / 0.9)
    # reto: ponta no meio da tela apontando pra câmera, corpo subindo e indo pra trás
    eixo = norm(np.array([0.0, 0.85, 1.0]))
    tip = np.array([0.0, -0.45 * z / 10, z])
    return tip, eixo, 0.52 + u * 0.9


def desenha_lapis(art, t):
    tip, eixo, giro = lapis_estado(t)
    faces = lapis_faces(tip, eixo, giro)
    d = ImageDraw.Draw(art)
    for _, pts, cor, i in faces:
        d.polygon(pts, fill=cor)
        if i in (2,):  # aresta fina entre as faces do corpo
            d.line(pts + [pts[0]], fill=tuple(int(c * 0.82) for c in cor), width=2)
        else:
            d.polygon(pts, fill=cor, outline=cor)
    return float(tip[2])


def contorno(art, larg):
    """contorno de tinta só na silhueta (não em cada face)."""
    al = art.getchannel('A')
    gr = al.filter(ImageFilter.MaxFilter(larg | 1))
    tinta = Image.new('RGBA', art.size, INK + (0,)); tinta.putalpha(gr)
    tinta.alpha_composite(art); return tinta


def sombra(paper_im, mask1x, z, zmax=48):
    k = max(0.0, 1 - z / zmax)
    off = (int(30 + 140 * k), int(50 + 200 * k)); blur = 6 + 30 * k
    sh = mask1x.transform((W, H), Image.AFFINE, (1, 0, -off[0], 0, 1, -off[1])).filter(ImageFilter.GaussianBlur(blur))
    a = np.array(sh, float)[..., None] / 255 * (0.32 - 0.14 * k)
    arr = np.array(paper_im, float) * (1 - a) + np.array([90, 80, 60], float) * a
    return Image.fromarray(arr.astype('uint8'))


# bolinhas: esfera com brilho, dentro de um túnel desenhado
def esfera(cor, n=400):
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / n * 2 - 1
    r2 = xx ** 2 + yy ** 2
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    nx, ny, nz = xx, -yy, -z
    lam = np.clip(nx * LUZ[0] + ny * LUZ[1] + nz * LUZ[2], 0, 1)
    h = norm(LUZ + np.array([0, 0, -1.0]))
    spec = np.clip(nx * h[0] + ny * h[1] + nz * h[2], 0, 1) ** 45
    c = np.array(cor, float) * (0.45 + 0.7 * lam[..., None]) + 255 * 0.9 * spec[..., None]
    c = np.clip(c, 0, 255)
    rim = np.clip((np.sqrt(r2) - 0.93) / 0.03, 0, 1)[..., None]
    c = c * (1 - rim) + np.array(INK, float) * rim
    alpha = np.clip((1 - np.sqrt(r2)) * n / 2, 0, 1) * 255
    return Image.fromarray(np.dstack([c, alpha]).astype('uint8'), 'RGBA')


CORES = [RED, BLUE, GREEN, YEL, PINK, (240, 140, 40)]
SPR = [esfera(c) for c in CORES]
random.seed(11)
PART = []
for _ in range(46):
    ang = random.uniform(0, 2 * math.pi); rr = random.uniform(1.2, 4.2)
    PART.append((rr * math.cos(ang), rr * math.sin(ang), random.uniform(0, 60), random.randrange(len(CORES))))
RT = 5.5   # raio do túnel


def dist_bol(t):
    u = max(0.0, t - B_INI)
    if t < 18.6: return 13 * u
    return 13 * (18.6 - B_INI) + 13 * 1.5 * (1 - (1 - min(1, (t - 18.6) / 1.5)) ** 2) / 2 + 5 * max(0, t - 20.1)


def desenha_bolinhas(art, t):
    d = ImageDraw.Draw(art)
    fade = ease((t - B_INI) / 0.7)
    dist = dist_bol(t)
    # linhas do túnel (retas que fogem pro centro)
    for k in range(16):
        ang = k * 2 * math.pi / 16
        x, y = RT * math.cos(ang), RT * math.sin(ang)
        p1 = proj2(np.array([x, y, 60.0])); p0 = proj2(np.array([x, y, 0.9]))
        d.line([p1, p0], fill=(120, 150, 190, int(150 * fade)), width=3)
    # anéis vindo na tua direção
    for k in range(15):
        z = (k * 4 - dist) % 60 + 0.9
        rp = S2 * FOC * RT / z
        al = int(min(1, (60 - z) / 25) * 200 * fade)
        w = max(2, int(S2 * 40 / z))
        d.ellipse([S2 * CX - rp, S2 * CY - rp, S2 * CX + rp, S2 * CY + rp], outline=(70, 110, 170, al), width=w)
    vis = []
    for x, y, z0, c in PART:
        for lag, aa in ((0.10, 0.18), (0.05, 0.35), (0.0, 1.0)):
            z = (z0 - dist_bol(t - lag)) % 60 + 0.9
            if lag and z > (z0 - dist) % 60 + 0.9: continue
            r = S2 * FOC * 0.55 / z
            sx, sy = proj2(np.array([x, y, z]))
            if r < 3 or sx + r < 0 or sx - r > 2 * W or sy + r < 0 or sy - r > 2 * H: continue
            vis.append((z, -lag, sx, sy, r, c, aa))
    vis.sort(key=lambda v: (-v[0], v[1]))
    for z, _, sx, sy, r, c, aa in vis:
        s = max(4, int(2 * r))
        sp = SPR[c].resize((s, s), Image.BILINEAR)
        k = min(1, (60 - z) / 18) * fade * aa
        if k < 1:
            sp.putalpha(sp.getchannel('A').point(lambda v: int(v * k)))
        art.alpha_composite(sp, (int(sx - s / 2), int(sy - s / 2)))


# ---------- rosto piscando, olhos, celular, cubo (em 2x) ----------
PELE = (255, 221, 178); PELE2 = (238, 190, 140)


def rosto(d, cx, cy, r):
    cx, cy, r = cx * S2, cy * S2, r * S2
    lw = int(r * 0.045)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PELE, outline=INK, width=lw)
    # cabelo
    d.chord([cx - r, cy - r, cx + r, cy + r * 0.9], 190, 350, fill=(92, 60, 40), outline=INK, width=lw)
    # bochechas
    for sx in (-1, 1):
        d.ellipse([cx + sx * 0.55 * r - 0.16 * r, cy + 0.22 * r - 0.09 * r, cx + sx * 0.55 * r + 0.16 * r, cy + 0.22 * r + 0.09 * r], fill=(250, 170, 160))
    # olho aberto (direita)
    ex, ey = cx + 0.36 * r, cy - 0.08 * r
    d.ellipse([ex - 0.2 * r, ey - 0.24 * r, ex + 0.2 * r, ey + 0.24 * r], fill=(255, 255, 255), outline=INK, width=lw)
    d.ellipse([ex - 0.12 * r, ey - 0.12 * r, ex + 0.12 * r, ey + 0.16 * r], fill=INK)
    d.ellipse([ex - 0.02 * r, ey - 0.08 * r, ex + 0.07 * r, ey + 0.01 * r], fill=(255, 255, 255))
    # olho fechado (esquerda) com cílios
    fx, fy = cx - 0.36 * r, cy - 0.06 * r
    d.arc([fx - 0.22 * r, fy - 0.14 * r, fx + 0.22 * r, fy + 0.14 * r], 10, 170, fill=INK, width=lw)
    for k, ang in enumerate((40, 90, 140)):
        a = math.radians(ang)
        x0, y0 = fx + 0.22 * r * math.cos(a), fy + 0.14 * r * math.sin(a)
        d.line([(x0, y0), (x0 + 0.08 * r * math.cos(a), y0 + 0.1 * r * math.sin(a))], fill=INK, width=int(lw * 0.8))
    # sobrancelhas
    d.arc([ex - 0.2 * r, ey - 0.5 * r, ex + 0.2 * r, ey - 0.2 * r], 200, 340, fill=INK, width=lw)
    d.line([(fx - 0.2 * r, fy - 0.3 * r), (fx + 0.18 * r, fy - 0.26 * r)], fill=INK, width=lw)
    # boca sorrindo de lado
    d.arc([cx - 0.3 * r, cy + 0.12 * r, cx + 0.34 * r, cy + 0.52 * r], 15, 150, fill=INK, width=lw)


def celular(d, cx, cy, s=1.0):
    cx, cy = cx * S2, cy * S2; w, h = 95 * s * S2, 175 * s * S2
    d.rounded_rectangle([cx - w, cy - h, cx + w, cy + h], int(36 * s * S2), fill=(60, 62, 72), outline=INK, width=int(8 * S2))
    d.rounded_rectangle([cx - w + 16 * s * S2, cy - h + 22 * s * S2, cx + w - 16 * s * S2, cy + h - 22 * s * S2], int(20 * s * S2), fill=(200, 228, 250))
    d.rounded_rectangle([cx - 28 * s * S2, cy - h + 8 * s * S2, cx + 28 * s * S2, cy - h + 16 * s * S2], 6, fill=(30, 30, 36))


def olho(d, cx, cy, s, fechado=False):
    cx, cy, s = cx * S2, cy * S2, s * S2; lw = int(4 * S2)
    if fechado:
        d.arc([cx - s, cy - s * 0.6, cx + s, cy + s * 0.6], 15, 165, fill=INK, width=lw)
        for ang in (45, 90, 135):
            a = math.radians(ang); x0, y0 = cx + s * math.cos(a), cy + 0.6 * s * math.sin(a)
            d.line([(x0, y0), (x0 + 0.3 * s * math.cos(a), y0 + 0.4 * s * math.sin(a))], fill=INK, width=lw)
        return
    d.ellipse([cx - s, cy - s * 0.62, cx + s, cy + s * 0.62], fill=(255, 255, 255), outline=INK, width=lw)
    d.ellipse([cx - s * 0.42, cy - s * 0.42, cx + s * 0.42, cy + s * 0.42], fill=BLUE)
    d.ellipse([cx - s * 0.2, cy - s * 0.2, cx + s * 0.2, cy + s * 0.2], fill=INK)
    d.ellipse([cx + s * 0.04, cy - s * 0.28, cx + s * 0.2, cy - s * 0.12], fill=(255, 255, 255))


def cubo(d, cx, cy, s):
    cx, cy, s = cx * S2, cy * S2, s * S2; o = s * 0.42
    fr = [(cx - s / 2, cy - s / 2 + o / 2), (cx + s / 2 - o, cy - s / 2 + o / 2), (cx + s / 2 - o, cy + s / 2), (cx - s / 2, cy + s / 2)]
    tp = [(cx - s / 2, cy - s / 2 + o / 2), (cx - s / 2 + o, cy - s / 2 - o / 2), (cx + s / 2, cy - s / 2 - o / 2), (cx + s / 2 - o, cy - s / 2 + o / 2)]
    sd = [(cx + s / 2 - o, cy - s / 2 + o / 2), (cx + s / 2, cy - s / 2 - o / 2), (cx + s / 2, cy + s / 2 - o), (cx + s / 2 - o, cy + s / 2)]
    for p, c in ((fr, (250, 212, 70)), (tp, (255, 236, 150)), (sd, (214, 165, 20))):
        d.polygon(p, fill=c); d.line(p + [p[0]], fill=INK, width=int(4 * S2), joint='curve')


def seta(d, x0, y, x1, cor=INK):
    x0, y, x1 = x0 * S2, y * S2, x1 * S2
    d.line([(x0, y), (x1, y)], fill=cor, width=int(6 * S2)); d.polygon([(x1 + 28 * S2, y), (x1 - 6 * S2, y - 20 * S2), (x1 - 6 * S2, y + 20 * S2)], fill=cor)


# textos: (ini, fim, y, texto, tamanho, cor, escreve?)
T = [(-1, B_FIM - 3.4, 140, 'Tampa um olho', 140, RED, False), (-1, B_FIM - 3.4, 300, 'e chega o celular perto', 92, INK, False),
     (8.4, P_FIM - 0.6, 1560, 'vem vindo...', 120, BLUE, True), (10.0, P_FIM - 0.6, 1700, 'cuidado!', 130, RED, True),
     (B_FIM - 3.4, EXP, 150, 'Abre os dois olhos', 120, GREEN, True), (20.3, EXP, 300, 'ficou chato, né?', 100, INK, True),
     (EXP, FINAL, 140, 'Por que funciona?', 120, INK, True),
     (22.6, FINAL, 760, '"é só uma tela reta"', 84, BLUE, True),
     (25.4, FINAL, 1340, '"acredito no desenho!"', 84, RED, True),
     (FINAL, DUR, 300, 'Sentiu sair da tela?', 120, INK, True), (29.9, DUR, 460, 'Comenta!', 130, GREEN, True),
     (30.8, DUR, 1260, 'Não sentiu? Volta...', 110, BLUE, True), (32.2, DUR, 1420, 'e tampa um olho', 130, RED, True)]
T = [(a, b, y, txt(s, sz, c), w) for a, b, y, s, sz, c, w in T]
WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120))
ESCRITA = 0.45


def frame(fr):
    t = fr / FPS
    im = BASE.copy()
    art = Image.new('RGBA', (2 * W, 2 * H), (0, 0, 0, 0)); d = ImageDraw.Draw(art)
    zl = None
    if t < P_INI:
        rosto(d, 540, 900, 290)
        s = 0.8 + 0.25 * ease((t - 1.6) / 2)
        celular(d, 540, 1520, s)
    elif t < P_FIM:
        zl = desenha_lapis(art, t)
    elif t < B_FIM:
        desenha_bolinhas(art, t)
    elif t < FINAL:
        y1, y2 = 560, 1140
        if t >= 22.2:
            olho(d, 210, y1, 75); olho(d, 400, y1, 75)
            if t >= 22.9: seta(d, 520, y1, 690, BLUE)
            if t >= 23.3: celular(d, 860, y1, 0.6)
        if t >= 25.0:
            olho(d, 210, y2, 75, fechado=True); olho(d, 400, y2, 75)
            if t >= 25.6: seta(d, 520, y2, 690, RED)
            if t >= 26.0: cubo(d, 860, y2 + 14 * math.sin((t - 26) * 4), 190)
    else:
        rosto(d, 540, 880, 190)
    if zl is not None:
        art = contorno(art, 7)
    small = art.resize((W, H), Image.LANCZOS)
    if zl is not None:
        im = sombra(im, small.getchannel('A'), zl)
    im.paste(small, (0, 0), small)
    for a, b, y, img, w in T:
        if a <= t < b:
            if w:
                p = min(1, (t - a) / ESCRITA); ww = max(1, int(img.width * p)); c = img.crop((0, 0, ww, img.height))
            else:
                c = img
            im.paste(c, ((W - img.width) // 2, y), c)
    pos = [(600, 1830), (130, 1830), (600, 40), (130, 40)][int(t // 7) % 4]
    im.paste(WM, pos, WM)
    return im


if __name__ == '__main__':
    if len(sys.argv) > 1:
        [frame(int(float(s) * FPS)).save(f'prev_{s}.png') for s in sys.argv[1:]]; sys.exit()
    inp = []; flt = []
    for i, (a, b, pos) in enumerate(FALAS):
        inp += ['-i', 'falas/take1.wav']
        flt.append(f'[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,adelay={int(pos * 1000)}:all=1[a{i}]')
    flt.append(''.join(f'[a{i}]' for i in range(len(FALAS))) + f'amix=inputs={len(FALAS)}:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-15:TP=-1.5[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', 'narracao.wav',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'tampa_um_olho.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)): p.stdin.write(frame(fr).tobytes())
    p.stdin.close(); p.wait()
