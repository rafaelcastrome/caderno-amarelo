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
    f = F(size); l, t, r, b = f.getbbox(s); im = Image.new('RGBA', (r - l + 20, b - t + 30), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10 - l, 10 - t), s, font=f, fill=fill); return im


# ---------- 3D ----------
FOC = 1000.0; CX, CY = 540, 1020
LUZ = np.array([-0.45, 0.6, -0.65]); LUZ /= np.linalg.norm(LUZ)


def proj(p):
    return (CX + FOC * p[0] / p[2], CY - FOC * p[1] / p[2])


def norm(v): return v / np.linalg.norm(v)


# seções do lápis: (x ao longo do eixo a partir da ponta, raio, cor do trecho até a próxima)
K = 1.5
SEC = [(0.0, 0.0, (60, 60, 66)), (0.38 * K, 0.13 * K, (240, 205, 160)), (1.45 * K, 0.42 * K, YEL), (7.0 * K, 0.42 * K, (190, 190, 198)),
       (7.55 * K, 0.42 * K, (240, 125, 145)), (8.2 * K, 0.42 * K, None)]


def lapis_faces(tip, eixo, giro):
    a = norm(eixo); b = norm(np.cross([0, 1, 0], a)); c = np.cross(a, b)
    rings = []
    for x, r, cor in SEC:
        pts = [tip + x * a + r * (math.cos(giro + k * math.pi / 3) * b + math.sin(giro + k * math.pi / 3) * c) for k in range(6)]
        rings.append((x, pts, cor))
    faces = []
    for i in range(len(rings) - 1):
        x0, p0, cor = rings[i]; x1, p1, _ = rings[i + 1]
        mid = tip + a * (x0 + x1) / 2
        for k in range(6):
            q = [p0[k], p0[(k + 1) % 6], p1[(k + 1) % 6], p1[k]]
            if SEC[i][1] == 0: q = [p0[0], p1[(k + 1) % 6], p1[k]]
            cen = sum(q) / len(q)
            n = norm(np.cross(q[1] - q[0], q[-1] - q[0]))
            if np.dot(n, cen - mid) < 0: n = -n
            # amarelo: faixas alternadas mais escuras, como lápis de verdade
            cc = cor
            if cor == YEL and k % 2: cc = (230, 175, 10)
            faces.append((q, n, cc))
    back = rings[-1][1]
    faces.append((back, a, (236, 120, 140)))
    out = []
    for q, n, cor in faces:
        cen = sum(q) / len(q)
        if np.dot(n, cen) >= 0: continue          # de costas pra câmera
        s = 0.72 + 0.4 * max(0, float(np.dot(n, LUZ)))
        out.append((cen[2], [proj(p) for p in q], tuple(min(255, int(v * s)) for v in cor)))
    out.sort(key=lambda f: -f[0])
    return out


def ease(u): u = min(1, max(0, u)); return u * u * (3 - 2 * u)


def lapis_estado(t):
    u = t - P_INI
    if u < 3.2: z = 42 - 34 * ease(u / 3.2)
    elif u < 4.0: z = 8 + 0.6 * math.sin((u - 3.2) * 7)
    elif u < 6.5: z = 8 - 6.7 * ease((u - 4.0) / 2.5) ** 1.4
    elif u < 7.2: z = 1.3 + 0.12 * math.sin((u - 6.5) * 30)
    else: z = 1.3 + 45 * ease((u - 7.2) / 0.9)
    x = -0.12 * z + 0.04 * z * math.sin(u * 1.3); y = 0.08 * z - 0.03 * z * math.cos(u * 1.1)
    eixo = np.array([0.85 + 0.2 * math.sin(u * 0.8), -0.6, 1.0])
    return np.array([x, y, z]), eixo, u * 1.4


def desenha_lapis(im, t):
    tip, eixo, giro = lapis_estado(t)
    faces = lapis_faces(tip, eixo, giro)
    z = float(tip[2])
    # sombra no papel: mesma silhueta, se afasta e espalha quando o lápis chega perto
    sil = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(sil)
    for _, pts, _ in faces: sd.polygon(pts, fill=255)
    k = max(0, 1 - z / 42)
    off = (int(40 + 260 * k ** 1.5), int(60 + 330 * k ** 1.5))
    blur = 4 + 26 * k ** 1.5
    sh = sil.transform((W, H), Image.AFFINE, (1, 0, -off[0], 0, 1, -off[1])).filter(ImageFilter.GaussianBlur(blur))
    a = np.array(sh, float)[..., None] / 255 * (0.42 - 0.22 * k)
    arr = np.array(im, float) * (1 - a) + np.array([90, 80, 60], float) * a
    im.paste(Image.fromarray(arr.astype('uint8')))
    d = ImageDraw.Draw(im)
    lw = max(2, int(3 + 30 / z))
    for _, pts, cor in faces:
        d.polygon(pts, fill=cor)
        d.line(pts + [pts[0]], fill=INK, width=lw, joint='curve')


# bolinhas: esferas com brilho, voando na direção de quem assiste
def esfera(cor, n=256):
    yy, xx = np.mgrid[0:n, 0:n] / (n - 1) * 2 - 1
    r2 = xx ** 2 + yy ** 2
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    nl = np.stack([xx, -yy, -z], -1) * -1
    lam = np.clip(nl @ (-LUZ * np.array([1, 1, 1])), 0, 1)
    lam = np.clip(-(xx * LUZ[0]) + (yy * -LUZ[1]) * -1 + z * -LUZ[2], 0, 1)
    spec = np.clip((-0.35 * xx - 0.35 * yy * -1 + z * 0.87), 0, 1) ** 40
    c = np.array(cor, float) * (0.35 + 0.75 * lam[..., None]) + 255 * 0.8 * spec[..., None]
    c = np.clip(c, 0, 255)
    edge = (r2 > 0.86) & (r2 <= 1)
    c[edge] = INK
    alpha = np.clip((1 - r2) * n * 0.5, 0, 1) * 255
    return Image.fromarray(np.dstack([c, alpha]).astype('uint8'), 'RGBA')


CORES = [RED, BLUE, GREEN, YEL, PINK, (240, 140, 40)]
SPR = [esfera(c) for c in CORES]
random.seed(7)
PART = [(random.uniform(-7, 7), random.uniform(-11, 11), random.uniform(0, 60), random.randrange(len(CORES))) for _ in range(170)]
PART = [(x, y, z, c) for x, y, z, c in PART if abs(x) > 0.5 or abs(y) > 0.5]


def desenha_bolinhas(im, t):
    u = t - B_INI
    vel = 16 if t < 18.6 else 16 - 10 * ease((t - 18.6) / 1.5)
    dist = 16 * min(u, 6.2) + (vel * (u - 6.2) if u > 6.2 else 0)
    if u > 6.2: dist = 16 * 6.2 + 16 * min(1.5, u - 6.2) * 0.6 + 6 * max(0, u - 7.7)
    vis = []
    for x, y, z0, c in PART:
        z = (z0 - dist) % 60 + 0.6
        if u < 1.0 and z < 60 - 60 * u: pass
        r = FOC * 0.32 / z
        sx, sy = CX + FOC * x / z, CY - FOC * y / z
        if r < 2 or sx + r < 0 or sx - r > W or sy + r < 0 or sy - r > H: continue
        vis.append((z, sx, sy, r, c))
    vis.sort(key=lambda v: -v[0])
    fade = ease(u / 0.8)
    for z, sx, sy, r, c in vis:
        s = max(2, int(2 * r))
        sp = SPR[c].resize((s, s), Image.BILINEAR)
        if z > 40 or fade < 1:
            al = np.array(sp)[..., 3].astype(float) * min(1, (60 - z) / 20) * fade
            sp.putalpha(Image.fromarray(al.astype('uint8')))
        im.paste(sp, (int(sx - s / 2), int(sy - s / 2)), sp)


# ---------- desenhos de apoio ----------
def rosto_tampando(d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=INK, width=8, fill=(255, 226, 190))
    d.ellipse([cx + 0.25 * r, cy - 0.3 * r, cx + 0.5 * r, cy - 0.05 * r], fill=INK)
    d.arc([cx - 0.35 * r, cy + 0.15 * r, cx + 0.35 * r, cy + 0.55 * r], 20, 160, fill=INK, width=8)
    # mão em cima do olho esquerdo
    hx, hy = cx - 0.42 * r, cy - 0.2 * r
    d.rounded_rectangle([hx - 0.42 * r, hy - 0.3 * r, hx + 0.38 * r, hy + 0.45 * r], 40, fill=(250, 210, 170), outline=INK, width=7)
    for i in range(4):
        fx = hx - 0.36 * r + i * 0.2 * r
        d.rounded_rectangle([fx, hy - 0.75 * r, fx + 0.16 * r, hy - 0.2 * r], 30, fill=(250, 210, 170), outline=INK, width=6)


def olho(d, cx, cy, s, fechado=False):
    if fechado:
        d.arc([cx - s, cy - s * 0.6, cx + s, cy + s * 0.6], 20, 160, fill=INK, width=8)
        for i in (-0.5, 0, 0.5): d.line([(cx + i * s, cy + 0.55 * s), (cx + i * s * 1.3, cy + 0.85 * s)], fill=INK, width=6)
        return
    d.ellipse([cx - s, cy - s * 0.62, cx + s, cy + s * 0.62], fill=(255, 255, 255), outline=INK, width=8)
    d.ellipse([cx - s * 0.4, cy - s * 0.4, cx + s * 0.4, cy + s * 0.4], fill=BLUE)
    d.ellipse([cx - s * 0.18, cy - s * 0.18, cx + s * 0.18, cy + s * 0.18], fill=INK)
    d.ellipse([cx + s * 0.05, cy - s * 0.25, cx + s * 0.2, cy - s * 0.1], fill=(255, 255, 255))


def celular(d, cx, cy):
    d.rounded_rectangle([cx - 70, cy - 120, cx + 70, cy + 120], 22, fill=(70, 70, 80), outline=INK, width=7)
    d.rectangle([cx - 52, cy - 95, cx + 52, cy + 95], fill=(251, 245, 223))


def cubo(d, cx, cy, s):
    o = s * 0.45
    fr = [(cx - s / 2, cy - s / 2 + o / 2), (cx + s / 2 - o, cy - s / 2 + o / 2), (cx + s / 2 - o, cy + s / 2), (cx - s / 2, cy + s / 2)]
    tp = [(cx - s / 2, cy - s / 2 + o / 2), (cx - s / 2 + o, cy - s / 2 - o / 2), (cx + s / 2, cy - s / 2 - o / 2), (cx + s / 2 - o, cy - s / 2 + o / 2)]
    sd = [(cx + s / 2 - o, cy - s / 2 + o / 2), (cx + s / 2, cy - s / 2 - o / 2), (cx + s / 2, cy + s / 2 - o), (cx + s / 2 - o, cy + s / 2)]
    d.polygon(fr, fill=(250, 215, 90), outline=INK); d.polygon(tp, fill=(255, 238, 160), outline=INK); d.polygon(sd, fill=(215, 170, 30), outline=INK)
    for p in (fr, tp, sd): d.line(p + [p[0]], fill=INK, width=7, joint='curve')


def seta(d, x0, y, x1, cor=INK):
    d.line([(x0, y), (x1, y)], fill=cor, width=9); d.polygon([(x1 + 30, y), (x1 - 8, y - 24), (x1 - 8, y + 24)], fill=cor)


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
    im = BASE.copy(); d = ImageDraw.Draw(im)
    if t < P_INI:
        rosto_tampando(d, 540, 1050, 300)
        # celular chegando perto (cresce um pouco)
        s = 1 + 0.25 * ease((t - 1.8) / 2)
        cx, cy = 540, 1600
        d.rounded_rectangle([cx - 90 * s, cy - 60 * s, cx + 90 * s, cy + 140 * s], 26, fill=(70, 70, 80), outline=INK, width=7)
        d.rectangle([cx - 72 * s, cy - 42 * s, cx + 72 * s, cy + 122 * s], fill=(190, 220, 245))
        if t > 1.8:
            d.line([(cx, cy - 75 * s), (cx, cy - 200)], fill=BLUE, width=9); d.polygon([(cx, cy - 235), (cx - 24, cy - 195), (cx + 24, cy - 195)], fill=BLUE)
    elif t < P_FIM:
        desenha_lapis(im, t)
    elif t < B_FIM:
        if t < B_INI + 0.3 and t < P_FIM: pass
        desenha_bolinhas(im, t)
    elif t < FINAL:
        # dois olhos -> tela reta ; um olho tampado -> acredita
        y1, y2 = 560, 1140
        if t >= 22.2:
            olho(d, 230, y1, 80); olho(d, 420, y1, 80)
            if t >= 22.9: seta(d, 540, y1, 700, BLUE)
            if t >= 23.3: celular(d, 860, y1)
        if t >= 25.0:
            olho(d, 230, y2, 80, fechado=True); olho(d, 420, y2, 80)
            if t >= 25.6: seta(d, 540, y2, 700, RED)
            if t >= 26.0:
                bob = 14 * math.sin((t - 26) * 4)
                cubo(d, 860, y2 + bob, 200)
    else:
        rosto_tampando(d, 540, 900, 170)
    for a, b, y, img, w in T:
        if a <= t < b:
            if w:
                p = min(1, (t - a) / ESCRITA); ww = max(1, int(img.width * p)); c = img.crop((0, 0, ww, img.height))
            else:
                c = img
            im.paste(c, ((W - img.width) // 2, y), c)
    pos = [(600, 1830), (130, 1830), (600, 40), (130, 40)][int(t // 7) % 4]
    if not (EXP <= t < FINAL) or pos[1] > 100:
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
