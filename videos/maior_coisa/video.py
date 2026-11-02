"""Qual é a maior coisa que existe? Zoom de escala no caderno, do grão de areia ao universo,
com o Caderninho escondido em 4 cenas. Gera maior_coisa.mp4.
Uso: python3 video.py              -> vídeo completo
     python3 video.py 1.0 12.5     -> só esses segundos (prev_*.png)
"""
import math, re, subprocess, sys, wave
import numpy as np
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, SS = 1080, 1920, 30, 2
TEMPO = 1.08
INK = (30, 30, 30); PAPER = (251, 245, 223); RED = (214, 40, 40); ORANGE = (225, 120, 25)
BLUE = (53, 103, 160); YEL = (245, 197, 24)
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s * SS)
LY = 9.461e15

# ---------------- áudio ----------------
# (início, fim) de cada fala no falas/take1.wav (cortes no meio dos silêncios)
FALAS = [(0.0, 2.15), (2.2, 5.05), (5.1, 7.85), (7.9, 10.05), (10.1, 13.25), (13.3, 16.35),
         (16.4, 19.8), (19.85, 23.2), (23.25, 27.35), (27.4, 31.6), (31.65, 36.3), (36.35, 41.8)]


def monta_audio():
    with wave.open('falas/take1.wav') as w:
        sr = w.getframerate(); pcm = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'falas/take1.wav', '-af',
                          'silencedetect=n=-40dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
    sil = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)],
                   [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]))
    clips = []
    for a, b in FALAS:
        # tira o silêncio da ponta
        for s, e in sil:
            if s <= a + 0.05 < e: a = max(a, e - 0.05)
            if s < b - 0.05 <= e: b = min(b, s + 0.08)
        partes = []; cur = a
        for s, e in sil:
            if s > a + 0.05 and e < b - 0.05 and e - s > 0.25:
                partes.append(pcm[int(cur * sr):int((s + 0.09) * sr)]); cur = e - 0.09
        partes.append(pcm[int(cur * sr):int(b * sr)])
        clips.append(np.concatenate(partes))
    gap = np.zeros(int(0.16 * sr), np.int16)
    starts = []; buf = [np.zeros(int(0.15 * sr), np.int16)]; n = len(buf[0])
    for i, c in enumerate(clips):
        if i == len(clips) - 1: buf.append(np.zeros(int(0.25 * sr), np.int16)); n += int(0.25 * sr)
        starts.append(n / sr / TEMPO); buf.append(c); buf.append(gap); n += len(c) + len(gap)
    full = np.concatenate(buf + [np.zeros(int(1.2 * sr), np.int16)])
    with wave.open('falas/montado.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(full.tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'falas/montado.wav', '-af',
                    f'atempo={TEMPO},loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'narracao.wav'], check=True)
    return starts, len(full) / sr / TEMPO


# ---------------- mundo (metros, y pra cima) ----------------
R_E, R_S = 6.371e6, 6.96e8
G_X = 0.0                                   # grão
A_X = -3.3e-3                               # formiga
P_X = -0.32                                 # tu
C_X = -12.0                                 # Cristo
E_X = C_X - 9.0 - 7000                      # Everest (pé direito encostado no Cristo)
EARTH = (0.0, -R_E)
SUN = (EARTH[0] - R_S - 4 * R_E, EARTH[1])
MW_R = 50000 * LY
MW = (SUN[0] + 0.52 * MW_R * 0.8, SUN[1] + 0.52 * MW_R * 0.6)
UNI_R = 46.5e9 * LY

# nível: (nome, valor, casas, unidade, mult, tamanho_m, px_em_repouso, centro)
NIV = [
    ('GRÃO DE AREIA', 1, 0, 'milímetro', None, 1e-3, 430, (G_X, 0.42e-3)),
    ('FORMIGA', 5, 0, 'milímetros', '5x maior', 5e-3, 640, (A_X, 1.2e-3)),
    ('TU', 1.7, 1, 'metro', '340x maior', 1.7, 640, (P_X, 0.85)),
    ('CRISTO REDENTOR', 38, 0, 'metros', '22x maior', 38, 700, (C_X, 19)),
    ('MONTE EVEREST', 8849, 0, 'metros', '230x maior', 15000, 1000, (E_X, 4400)),
    ('A TERRA', 12742, 0, 'quilômetros', '1.440x maior', 2 * R_E, 700, EARTH),
    ('O SOL', 1392000, 0, 'quilômetros', '109x maior', 2 * R_S, 720, SUN),
    ('SISTEMA SOLAR', 9, 0, 'bilhões de km', '6.500x maior', 9e12, 980, SUN),
    ('VIA LÁCTEA', 100000, 0, 'anos-luz', '100.000.000x maior', 2 * MW_R, 920, MW),
    ('UNIVERSO VISÍVEL', 93, 0, 'bilhões de anos-luz', '930.000x maior', 2 * UNI_R, 930, MW),
]
CAM_Y = 1180                                 # onde fica o centro da câmera na tela
TT = 0.95                                    # duração da transição
DRIFT = 0.03                                 # décadas por segundo de afastamento lento


def ease(x):
    x = min(1, max(0, x)); return x * x * x * (x * (6 * x - 15) + 10)


class Cam:
    def __init__(self, starts):
        # nível 0 parado desde o início; nível k entra quando começa a fala k+1
        self.T = [0.0] + [starts[k + 1] for k in range(1, len(NIV))]

    def at(self, t):
        T = self.T; k = max(i for i in range(len(T)) if T[i] <= t)
        def Lrest(i): return math.log10(NIV[i][5] / NIV[i][6])
        def hold_L(i, tt):        # L na espera do nível i
            t0 = T[i] + (TT if i else 0); return Lrest(i) + DRIFT * max(0, tt - t0)
        if k > 0 and t < T[k] + TT:
            La = hold_L(k - 1, T[k]); Lb = Lrest(k); e = ease((t - T[k]) / TT)
            L = La + (Lb - La) * e
            ma, mb, m = 10 ** La, 10 ** Lb, 10 ** L
            ca, cb = NIV[k - 1][7], NIV[k][7]
            # o centro antigo desliza na tela do meio até a posição final
            c = (ca[0] - m * e * (ca[0] - cb[0]) / mb, ca[1] - m * e * (ca[1] - cb[1]) / mb)
            return k, L, c, e
        return k, hold_L(k, t), NIV[k][7], 1.0


# ---------------- desenho ----------------
def paper():
    im = Image.new('RGB', (W * SS, H * SS), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x * SS, 0), (x * SS, H * SS)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=SS if (x - 30) % 216 else 2 * SS)
    for y in range(30, H, 54):
        d.line([(0, y * SS), (W * SS, y * SS)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=SS if (y - 30) % 216 else 2 * SS)
    d.rectangle([88 * SS, 0, 90 * SS, H * SS], fill=(236, 170, 150)); return im


PAPEL = paper()
LIM = 60000


def cl(v): return max(-LIM, min(LIM, v))


class View:
    def __init__(self, L, c):
        self.s = 1 / 10 ** L * SS; self.c = c
    def p(self, x, y):
        return (cl(W * SS / 2 + (x - self.c[0]) * self.s), cl(CAM_Y * SS - (y - self.c[1]) * self.s))
    def px(self, m): return m * self.s / SS        # tamanho em px de tela (1x)


def onscreen(v, x, y, r):
    sx, sy = W * SS / 2 + (x - v.c[0]) * v.s, CAM_Y * SS - (y - v.c[1]) * v.s
    R = r * v.s
    return sx + R > -50 and sx - R < W * SS + 50 and sy + R > -50 and sy - R < H * SS + 50


def poly(d, pts, fill, outline=INK, w=4):
    d.polygon(pts, fill=fill)
    if outline: d.line(pts + [pts[0]], fill=outline, width=w * SS, joint='curve')


def circle(d, v, cx, cy, r, fill, outline=INK, w=4, n=None):
    Rpx = r * v.s
    if Rpx < 1.2 * SS:
        x, y = v.p(cx, cy); rr = 1.2 * SS; d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=outline or fill); return
    if Rpx < 30000:
        n = n or max(24, min(720, int(Rpx / 3)))
        pts = [v.p(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
        poly(d, pts, fill, outline, w); return
    # círculo gigante: só o arco visível
    sx, sy = W * SS / 2 + (cx - v.c[0]) * v.s, CAM_Y * SS - (cy - v.c[1]) * v.s
    dist = math.hypot(W * SS / 2 - sx, CAM_Y * SS - sy)
    if dist - Rpx > 3000 * SS: return                     # longe da tela
    if Rpx - dist > 3000 * SS:                            # tela toda dentro
        d.rectangle([0, 0, W * SS, H * SS], fill=fill); return
    ang0 = math.atan2(-(CAM_Y * SS - sy), (W * SS / 2 - sx))   # direção do centro pra câmera (tela, y pra baixo)
    dlt = 6000 / Rpx; pts = []
    for i in range(61):
        a = ang0 - dlt + 2 * dlt * i / 60
        pts.append((cl(sx + Rpx * math.cos(a)), cl(sy - Rpx * math.sin(a))))
    ux, uy = math.cos(ang0), -math.sin(ang0)          # centro -> câmera (tela)
    pts += [(cl(pts[-1][0] - ux * 30000), cl(pts[-1][1] - uy * 30000)), (cl(pts[0][0] - ux * 30000), cl(pts[0][1] - uy * 30000))]
    d.polygon(pts, fill=fill)
    d.line(pts[:61], fill=outline, width=w * SS)


rng = np.random.default_rng(3)
GRAO = [(0.5e-3 * (1 + 0.13 * math.sin(3 * a + 1) + 0.07 * math.sin(7 * a + 2) + 0.05 * math.cos(11 * a)), a)
        for a in np.linspace(0, 2 * math.pi, 40, endpoint=False)]
GRAO_PINTAS = [(rng.uniform(-0.35, 0.35), rng.uniform(-0.3, 0.3), rng.uniform(0.02, 0.05)) for _ in range(14)]


def d_grao(d, v):
    if not onscreen(v, G_X, 0.42e-3, 1e-3): return
    pts = [v.p(G_X + r * math.cos(a), 0.42e-3 + 0.85 * r * math.sin(a)) for r, a in GRAO]
    poly(d, pts, (226, 196, 128))
    if v.px(1e-3) > 60:
        for x, y, r in GRAO_PINTAS:
            a, b = v.p(G_X + x * 1e-3 - r * 1e-3, 0.42e-3 + y * 1e-3 + r * 1e-3); c, e = v.p(G_X + x * 1e-3 + r * 1e-3, 0.42e-3 + y * 1e-3 - r * 1e-3)
            d.ellipse([a, b, c, e], fill=(190, 156, 92))
        a, b = v.p(G_X - 0.25e-3, 0.72e-3); c, e = v.p(G_X - 0.05e-3, 0.62e-3)
        d.ellipse([a, b, c, e], fill=(250, 235, 190))


def d_formiga(d, v, t):
    u = 1e-3; x0 = A_X
    if not onscreen(v, x0, 1e-3, 5e-3) or v.px(5e-3) > 1400: return
    w = max(2, min(4, int(v.px(5e-3) / 120)))
    def ell(cx, cy, rx, ry, fill):
        n = 28; pts = [v.p(x0 + (cx + rx * math.cos(2 * math.pi * i / n)) * u, (cy + ry * math.sin(2 * math.pi * i / n)) * u) for i in range(n)]
        poly(d, pts, fill, INK, w)
    # pernas
    for i, bx in enumerate([-0.5, 0.0, 0.45]):
        ph = math.sin(t * 9 + i * 2) * 0.12
        for s in (-1, 1):
            d.line([v.p(x0 + bx * u, 1.25 * u), v.p(x0 + (bx + s * 0.55 + ph) * u, 1.6 * u), v.p(x0 + (bx + s * 0.9 + ph) * u, 0)], fill=INK, width=w * SS, joint='curve')
    ell(-1.35, 1.35, 1.0, 0.7, (120, 50, 30))     # abdômen
    ell(0.0, 1.35, 0.55, 0.38, (140, 60, 35))     # tórax
    ell(1.25, 1.55, 0.6, 0.5, (140, 60, 35))      # cabeça
    d.line([v.p(x0 + 1.5 * u, 1.95 * u), v.p(x0 + 2.0 * u, 2.6 * u), v.p(x0 + 2.45 * u, 2.4 * u)], fill=INK, width=w * SS, joint='curve')
    ex, ey = v.p(x0 + 1.5 * u, 1.65 * u); r = max(1, v.px(0.12e-3)) * SS
    d.ellipse([ex - r, ey - r, ex + r, ey + r], fill=(255, 255, 255))


def d_pessoa(d, v, t):
    x0 = P_X
    if not onscreen(v, x0, 0.85, 1.7): return
    w = max(2, min(4, int(v.px(1.7) / 150)))
    def R(x1, y1, x2, y2, fill):
        poly(d, [v.p(x0 + x1, y1), v.p(x0 + x2, y1), v.p(x0 + x2, y2), v.p(x0 + x1, y2)], fill, INK, w)
    R(-0.15, 0.0, -0.04, 0.82, (60, 60, 80)); R(0.04, 0.0, 0.15, 0.82, (60, 60, 80))      # pernas
    R(-0.2, 0.75, 0.2, 1.0, (40, 60, 120))                                               # bermuda
    R(-0.22, 0.98, 0.22, 1.42, (30, 160, 150))                                            # camiseta
    R(-0.3, 1.0, -0.21, 1.38, (240, 200, 160)); R(0.21, 1.0, 0.3, 1.38, (240, 200, 160))   # braços
    n = 30; pts = [v.p(x0 + 0.14 * math.cos(2 * math.pi * i / n), 1.56 + 0.15 * math.sin(2 * math.pi * i / n)) for i in range(n)]
    poly(d, pts, (240, 200, 160), INK, w)
    pts = [v.p(x0 + 0.15 * math.cos(math.pi * i / 14), 1.6 + 0.13 * math.sin(math.pi * i / 14)) for i in range(15)]
    poly(d, pts, (70, 45, 30), INK, w)
    if v.px(1.7) > 120:
        for ex in (-0.05, 0.05):
            a, b = v.p(x0 + ex - 0.015, 1.57); c, e = v.p(x0 + ex + 0.015, 1.54); d.ellipse([a, b, c, e], fill=INK)
        d.arc([*v.p(x0 - 0.06, 1.53), *v.p(x0 + 0.06, 1.45)], 20, 160, fill=INK, width=w * SS // 2 + 1)


def d_cristo(d, v):
    x0 = C_X
    if not onscreen(v, x0, 19, 38): return
    w = max(2, min(4, int(v.px(38) / 150)))
    pedra, sombra = (215, 212, 200), (175, 172, 160)
    poly(d, [v.p(x0 - 6, 0), v.p(x0 + 6, 0), v.p(x0 + 4.5, 8), v.p(x0 - 4.5, 8)], sombra, INK, w)   # pedestal
    poly(d, [v.p(x0 - 4.2, 8), v.p(x0 + 4.2, 8), v.p(x0 + 2.6, 29), v.p(x0 - 2.6, 29)], pedra, INK, w)  # manto
    poly(d, [v.p(x0 - 14, 27.6), v.p(x0 + 14, 27.6), v.p(x0 + 14, 30.4), v.p(x0 - 14, 30.4)], pedra, INK, w)  # braços
    poly(d, [v.p(x0 - 2.8, 26.5), v.p(x0 + 2.8, 26.5), v.p(x0 + 2.8, 31), v.p(x0 - 2.8, 31)], pedra, None)
    n = 28; pts = [v.p(x0 + 1.9 * math.cos(2 * math.pi * i / n), 33.2 + 2.3 * math.sin(2 * math.pi * i / n)) for i in range(n)]
    poly(d, pts, pedra, INK, w)
    if v.px(38) > 150:
        d.line([v.p(x0, 26), v.p(x0, 9)], fill=sombra, width=w * SS)


EV = [(-7000, 0), (-5200, 2600), (-4300, 2200), (-2600, 5200), (-1500, 4700), (0, 8849), (900, 7600),
      (1700, 7900), (3600, 4300), (4700, 4800), (7000, 0)]
NEVE = [(-2600, 5200), (-1500, 4700), (0, 8849), (900, 7600), (1700, 7900), (2600, 6100), (1500, 6600),
        (800, 6200), (-300, 7100), (-1200, 5900), (-2100, 5600)]


def d_everest(d, v):
    if not onscreen(v, E_X, 4400, 9000): return
    if v.px(15000) > 40000: return
    w = max(2, min(4, int(v.px(15000) / 200)))
    poly(d, [v.p(E_X + x, y) for x, y in EV], (140, 135, 150), INK, w)
    poly(d, [v.p(E_X + x, y) for x, y in NEVE], (250, 252, 255), INK, max(1, w - 1))
    if v.px(15000) > 200:
        d.line([v.p(E_X - 3000, 1200), v.p(E_X - 1200, 3900)], fill=(110, 105, 120), width=w * SS)
        d.line([v.p(E_X + 2500, 1500), v.p(E_X + 1200, 5200)], fill=(110, 105, 120), width=w * SS)


CONT = []
for (ca, cr, sz, sd) in [(math.pi / 2, 0.55, 0.42, 1), (2.6, 0.45, 0.3, 2), (5.2, 0.5, 0.33, 3), (0.4, 0.62, 0.22, 4)]:
    r2 = np.random.default_rng(sd)
    ph = r2.uniform(0, 6, 3)
    pts = []
    for a in np.linspace(0, 2 * math.pi, 30, endpoint=False):
        rr = sz * (1 + 0.25 * math.sin(3 * a + ph[0]) + 0.15 * math.sin(5 * a + ph[1]) + 0.1 * math.sin(8 * a + ph[2]))
        pts.append((cr * math.cos(ca) + rr * math.cos(a), cr * math.sin(ca) + 0.8 * rr * math.sin(a)))
    CONT.append(pts)


def d_terra(d, v):
    Rpx = v.px(R_E)
    if not onscreen(v, *EARTH, R_E): return
    if Rpx > 4000:     # chão
        circle(d, v, *EARTH, R_E, (222, 200, 150), INK, 4); return
    circle(d, v, *EARTH, R_E, (80, 150, 225), INK, 4 if Rpx > 30 else 3)
    if Rpx > 25:
        for pts in CONT:
            poly(d, [v.p(EARTH[0] + x * R_E, EARTH[1] + y * R_E) for x, y in pts], (90, 175, 85), INK, 3 if Rpx > 150 else 2)
        if Rpx > 120:
            for (x, y, l) in [(-0.6, 0.2, 0.35), (0.1, -0.5, 0.4), (0.3, 0.75, 0.3)]:
                d.line([v.p(EARTH[0] + x * R_E, EARTH[1] + y * R_E), v.p(EARTH[0] + (x + l) * R_E, EARTH[1] + (y + 0.05) * R_E)], fill=(255, 255, 255), width=5 * SS)


SOL_SP = [(rng.uniform(-0.5, 0.5), rng.uniform(-0.5, 0.5), rng.uniform(0.03, 0.07)) for _ in range(7)]


def d_sol(d, v, t):
    Rpx = v.px(R_S)
    if not onscreen(v, *SUN, R_S * 1.2): return
    if Rpx < 4:
        x, y = v.p(*SUN); r = 5 * SS
        d.ellipse([x - 2.4 * r, y - 2.4 * r, x + 2.4 * r, y + 2.4 * r], fill=(255, 225, 120))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(250, 170, 20)); return
    if Rpx > 15000:
        circle(d, v, *SUN, R_S, (255, 196, 40), INK, 4); return
    n = max(40, min(720, int(Rpx / 2)))
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        rr = R_S * (1 + 0.025 * math.sin(14 * a + t * 3) + 0.015 * math.sin(23 * a - t * 2))
        pts.append(v.p(SUN[0] + rr * math.cos(a), SUN[1] + rr * math.sin(a)))
    poly(d, pts, (255, 196, 40), INK, 4)
    if Rpx > 40:
        circle(d, v, SUN[0], SUN[1], R_S * 0.72, (255, 160, 30), None, 0)
        for x, y, r in SOL_SP:
            circle(d, v, SUN[0] + x * R_S, SUN[1] + y * R_S, r * R_S, (190, 90, 20), None, 0)


ORB = [(5.8e10, (150, 140, 130)), (1.08e11, (230, 190, 110)), (1.5e11, (80, 150, 225)), (2.28e11, (210, 90, 50)),
       (7.78e11, (210, 160, 110)), (1.43e12, (230, 200, 120)), (2.87e12, (130, 210, 220)), (4.5e12, (70, 100, 210))]
SQ = 0.42


def d_sistema(d, v, t):
    for i, (r, cor) in enumerate(ORB):
        rp = v.px(r)
        if rp < 3 or rp > 20000: continue
        n = max(40, min(400, int(rp / 2)))
        pts = [v.p(SUN[0] + r * math.cos(2 * math.pi * k / n), SUN[1] + SQ * r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        d.line(pts + [pts[0]], fill=(120, 140, 180), width=2 * SS)
        a = t * (1.6 / math.sqrt((i + 1))) + i * 1.7
        x, y = v.p(SUN[0] + r * math.cos(a), SUN[1] + SQ * r * math.sin(a))
        rr = (5 + (3 if i in (4, 5) else 0)) * SS
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=cor, outline=INK, width=SS * 2)


# Via Láctea: dois braços espirais
r3 = np.random.default_rng(9)
MWP = []
for k in range(1700):
    arm = k % 2; u = r3.uniform(0.08, 1.0) ** 0.8
    th = arm * math.pi + 4.2 * math.log(u / 0.08 + 1e-9) / 2.0 + r3.normal(0, 0.28)
    rr = u * (1 + r3.normal(0, 0.06))
    col = [(120, 110, 220), (90, 140, 230), (190, 120, 210), (255, 255, 255)][r3.integers(0, 4)]
    MWP.append((rr * math.cos(th), rr * math.sin(th), col, r3.uniform(0.6, 1.4)))


def d_via(d, v, t):
    Rpx = v.px(MW_R)
    if Rpx < 1: return
    rot = t * 0.06
    cr, sr = math.cos(rot), math.sin(rot)
    if Rpx < 1500:
        circle(d, v, *MW, MW_R * 1.05, (232, 228, 245) if Rpx > 30 else (200, 190, 240), None, 0)
    for x, y, col, sz in MWP:
        X = MW[0] + MW_R * (x * cr - y * sr); Y = MW[1] + MW_R * 0.75 * (x * sr + y * cr)
        sx, sy = v.p(X, Y)
        if -20 < sx < W * SS + 20 and -20 < sy < H * SS + 20:
            r = max(1.0, min(4.0, sz * Rpx / 220)) * SS
            d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=col)
    if Rpx > 8:
        circle(d, v, *MW, MW_R * 0.13, (255, 230, 150), None, 0)
        circle(d, v, *MW, MW_R * 0.07, (255, 250, 220), None, 0)


r4 = np.random.default_rng(21)
NOS = []
while len(NOS) < 420:
    x, y = r4.uniform(-1, 1, 2)
    if x * x + y * y < 0.97: NOS.append((x, y))
NOS = np.array(NOS)
LIG = []
for i in range(len(NOS)):
    dd = np.hypot(*(NOS - NOS[i]).T); idx = np.argsort(dd)[1:4]
    for j in idx:
        if dd[j] < 0.16 and i < j: LIG.append((i, j))


def d_universo(d, v):
    Rpx = v.px(UNI_R)
    if Rpx < 30 or Rpx > 3000: return
    f = min(1, max(0, (3000 - Rpx) / 1800))
    mix = lambda c: tuple(int(p + (q - p) * f) for p, q in zip(PAPER, c))
    circle(d, v, *MW, UNI_R, mix((30, 28, 70)), INK, 5)
    for i, j in LIG:
        d.line([v.p(MW[0] + NOS[i][0] * UNI_R, MW[1] + NOS[i][1] * UNI_R), v.p(MW[0] + NOS[j][0] * UNI_R, MW[1] + NOS[j][1] * UNI_R)],
               fill=mix((120, 110, 200)), width=2 * SS)
    for k, (x, y) in enumerate(NOS):
        sx, sy = v.p(MW[0] + x * UNI_R, MW[1] + y * UNI_R); r = (2.5 if k % 3 else 4) * SS
        d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(255, 200, 90) if k % 3 else (255, 240, 200))


def dash_circle(d, x, y, r, a=1.0):
    for k in range(16):
        a0 = k * 22.5
        d.arc([x - r, y - r, x + r, y + r], a0, a0 + 13, fill=RED, width=4 * SS)


# ---------------- Caderninho (mascote escondido) ----------------
def caderninho(d, x, y, h, t, aceno=True):
    """x,y = pés (coordenadas já em 2x); h = altura em px 2x"""
    w = h * 0.72; top = y - h; lw = max(2, int(h / 22))
    by = y - h * 0.18
    # pernas
    for s in (-1, 1):
        d.line([(x + s * w * 0.2, by), (x + s * w * 0.24, y)], fill=INK, width=lw)
    # braços (um acenando)
    ang = math.sin(t * 8) * 0.5 if aceno else 0
    d.line([(x - w / 2, by - h * 0.35), (x - w * 0.85, by - h * 0.15)], fill=INK, width=lw)
    d.line([(x + w / 2, by - h * 0.4), (x + w / 2 + h * 0.35 * math.cos(-1.0 + ang), by - h * 0.4 + h * 0.35 * math.sin(-1.0 + ang))], fill=INK, width=lw)
    d.rounded_rectangle([x - w / 2, top, x + w / 2, by], radius=h * 0.08, fill=YEL, outline=INK, width=lw)
    for k in range(4):   # espiral
        yy = top + h * 0.12 + k * h * 0.17; rr = h * 0.045
        d.ellipse([x - w / 2 - rr, yy - rr, x - w / 2 + rr, yy + rr], outline=INK, width=max(1, lw // 2))
    for s in (-1, 1):
        ex, ey, er = x + s * w * 0.17 + w * 0.06, top + h * 0.3, h * 0.09
        d.ellipse([ex - er, ey - er, ex + er, ey + er], fill=(255, 255, 255), outline=INK, width=max(1, lw // 2))
        d.ellipse([ex - er * 0.45, ey - er * 0.2, ex + er * 0.45, ey + er * 0.6], fill=INK)
    d.arc([x - w * 0.18 + w * 0.06, top + h * 0.38, x + w * 0.18 + w * 0.06, top + h * 0.58], 15, 165, fill=INK, width=lw)


# onde ele aparece: (nível, ponto no mundo, altura px, bandeirinha)
ESCONDIDO = [(0, (G_X - 0.78e-3, 0.0), 30, False),
             (3, (C_X - 13.2, 30.4), 30, False),
             (4, (E_X, 8849), 30, True),
             (5, (EARTH[0] + 1.25 * R_E, EARTH[1] + 0.9 * R_E), 30, False)]


# ---------------- texto ----------------
_cache = {}
def T(s, size, fill, stroke=6):
    k = (s, size, fill, stroke)
    if k not in _cache:
        f = F(size); l, tp, r, b = f.getbbox(s)
        im = Image.new('RGBA', (r - l + 30 * SS, b - tp + 30 * SS), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((15 * SS - l, 15 * SS - tp), s, font=f, fill=fill, stroke_width=stroke * SS, stroke_fill=PAPER)
        _cache[k] = im
    return _cache[k]


def put(im, s, size, fill, y, x=None, alpha=1.0, esc=1.0, stroke=6):
    img = T(s, size, fill, stroke)
    if esc != 1.0: img = img.resize((max(1, int(img.width * esc)), max(1, int(img.height * esc))), Image.LANCZOS)
    if alpha < 1:
        img = img.copy(); img.putalpha(img.getchannel('A').point(lambda p: int(p * alpha)))
    x = (W * SS - img.width) // 2 if x is None else x
    im.paste(img, (int(x), int(y * SS - (img.height - T(s, size, fill, stroke).height) / 2)), img)


def fmt(v, casas):
    s = f'{v:,.{casas}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return s


WM_POS = [(560, 1790), (130, 1790), (560, 1580), (130, 1700)]


# ---------------- quadro ----------------
def frame(args):
    t, starts, cam_T = args
    cam = Cam(starts); cam.T = cam_T
    k, L, c, e = cam.at(t)
    v = View(L, c)
    im = PAPEL.copy(); d = ImageDraw.Draw(im)
    # do maior pro menor
    d_universo(d, v); d_via(d, v, t); d_sistema(d, v, t); d_sol(d, v, t); d_terra(d, v)
    d_everest(d, v); d_cristo(d, v); d_pessoa(d, v, t); d_formiga(d, v, t); d_grao(d, v)
    # círculo tracejado no nível anterior quando ele vira pontinho
    if k >= 1 and e >= 1:
        pk = NIV[k - 1]; sz = v.px(pk[5])
        if sz < 45:
            x, y = v.p(*pk[7]); r = (34 + 6 * math.sin(t * 6)) * SS
            dash_circle(d, x, y, r)
    # Caderninho escondido
    for nv, pt, hh, band in ESCONDIDO:
        ini = cam.T[nv] + (TT * 0.6 if nv else 0)
        fim = cam.T[nv + 1] + TT * 0.5 if nv + 1 < len(cam.T) else 1e9
        if ini <= t <= fim:
            x, y = v.p(*pt)
            if -50 < x < W * SS + 50 and -50 < y < H * SS + 50:
                if band:
                    d.line([(x + 14 * SS, y), (x + 14 * SS, y - 52 * SS)], fill=INK, width=2 * SS)
                    d.polygon([(x + 14 * SS, y - 52 * SS), (x + 30 * SS, y - 46 * SS), (x + 14 * SS, y - 40 * SS)], fill=RED)
                caderninho(d, x - 4 * SS, y, hh * SS, t)
    # ---- cabeçalho ----
    if t < starts[1]:
        put(im, 'Qual é a maior coisa', 104, INK, 170)
        put(im, 'que existe?', 104, INK, 290)
    elif t < starts[11]:
        lv = NIV[k]; tk = cam.T[k] if k else starts[1]
        p = ease((t - tk) / 0.7) if k else 1.0
        put(im, lv[0], 62, BLUE, 110)
        put(im, '≈ ' + fmt(lv[1] * p, lv[2]) if lv[2] or lv[1] * p >= 1 else '≈ 0', 150, INK, 175)
        put(im, lv[3], 60, INK, 345)
        if lv[4]: put(im, lv[4], 56, ORANGE, 420, alpha=min(1, max(0, (t - tk - 0.5) / 0.3)))
    else:
        # final: Caderninho grande pergunta
        a = ease((t - starts[11]) / 0.4)
        ov = Image.new('RGBA', im.size, PAPER + (int(215 * a),)); im.paste(ov, (0, 0), ov)
        d = ImageDraw.Draw(im)
        put(im, 'Tu viu o Caderninho?', 100, INK, 230, alpha=a)
        if a > 0.05:
            caderninho(d, W * SS / 2, (1120 + 18 * math.sin(t * 5)) * SS, 420 * SS * a, t)
        put(im, 'Quantas vezes', 110, RED, 1300, alpha=min(1, max(0, (t - starts[11] - 0.9) / 0.3)))
        put(im, 'ele apareceu?', 110, RED, 1420, alpha=min(1, max(0, (t - starts[11] - 0.9) / 0.3)))
        put(im, 'comenta o número', 78, BLUE, 1580, alpha=min(1, max(0, (t - starts[11] - 2.0) / 0.3)))
    # marca d'água que muda de lugar
    wx, wy = WM_POS[int(t // 7) % len(WM_POS)]
    put(im, '@Cardeno_Amarelo', 46, (150, 140, 120), wy, x=wx * SS, stroke=0)
    return np.asarray(im.resize((W, H), Image.LANCZOS)).tobytes()


def main():
    starts, dur = monta_audio()
    cam = Cam(starts)
    print('falas em', [round(s, 2) for s in starts], 'duração', round(dur, 2))
    if len(sys.argv) > 1:
        for s in sys.argv[1:]:
            t = float(s); Image.frombytes('RGB', (W, H), frame((t, starts, cam.T))).save(f'prev_{s}.png')
        return
    n = int(dur * FPS)
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                           '-i', '-', '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                           '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', 'maior_coisa.mp4'], stdin=subprocess.PIPE)
    with Pool() as pool:
        for i, fr in enumerate(pool.imap(frame, [(i / FPS, starts, cam.T) for i in range(n)], chunksize=8)):
            ff.stdin.write(fr)
            if i % 150 == 0: print(i, '/', n, flush=True)
    ff.stdin.close(); ff.wait()


if __name__ == '__main__':
    main()
