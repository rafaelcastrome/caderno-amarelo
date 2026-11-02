"""Qual é a maior coisa que existe? Zoom de escala no caderno, do grão de areia ao universo,
com o Caderninho escondido em 4 cenas. Gera maior_coisa.mp4.
Uso: python3 video.py              -> vídeo completo
     python3 video.py 1.0 12.5     -> só esses segundos (prev_*.png)
"""
import math, re, subprocess, sys, wave
import numpy as np
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFont, ImageFilter

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


# ---------- figuras realistas (sprites.py gera sprites/*.png) ----------
def _spr(n): return Image.open(f'sprites/{n}.png').convert('RGBA')
SP = {n: _spr(n) for n in ['grao', 'formiga', 'pessoa', 'cristo', 'everest', 'terra', 'sol', 'via', 'universo']}
K_TERRA, K_SOL = 1300 / 1480, 1200 / 1800
GW = 1e-3 / 0.86
# retângulos no mundo: (x0, x1, y0, y1)
RET = {
    'grao': (G_X - GW / 2, G_X + GW / 2, -0.07 * GW * 600 / 700, GW * 600 / 700 * 0.93),
    'formiga': (A_X - 3e-3, A_X + 3e-3, 0, 3e-3),
    'pessoa': (P_X - 0.5, P_X + 0.5, 0, 1.8),
    'cristo': (C_X - 15, C_X + 15, 0, 39),
    'everest': (E_X - 9000, E_X + 9000, -1400, 9600),
    'terra': (EARTH[0] - R_E / K_TERRA, EARTH[0] + R_E / K_TERRA, EARTH[1] - R_E / K_TERRA, EARTH[1] + R_E / K_TERRA),
    'sol': (SUN[0] - R_S / K_SOL, SUN[0] + R_S / K_SOL, SUN[1] - R_S / K_SOL, SUN[1] + R_S / K_SOL),
    'via': (MW[0] - MW_R, MW[0] + MW_R, MW[1] - MW_R, MW[1] + MW_R),
    'universo': (MW[0] - UNI_R, MW[0] + UNI_R, MW[1] - UNI_R, MW[1] + UNI_R),
}
# cume do Everest achado no próprio desenho
_a = np.asarray(SP['everest'])[..., 3]; _ys, _xs = np.nonzero(_a > 200); _i = np.argmin(_ys)
_r = RET['everest']
CUME = (_r[0] + (_xs[_i] + 0.5) / _a.shape[1] * (_r[1] - _r[0]), _r[3] - _ys[_i] / _a.shape[0] * (_r[3] - _r[2]))


def raw(v, x, y):
    return W * SS / 2 + (x - v.c[0]) * v.s, CAM_Y * SS - (y - v.c[1]) * v.s


def cola(im, v, nome, alpha=1.0, rect=None):
    spr = SP[nome]; x0, x1, y0, y1 = rect or RET[nome]
    L, T_ = raw(v, x0, y1); R, B = raw(v, x1, y0)
    if R - L < 2 or R < 0 or L > W * SS or B < 0 or T_ > H * SS: return
    vx0, vy0, vx1, vy1 = max(0, L), max(0, T_), min(W * SS, R), min(H * SS, B)
    if vx1 - vx0 < 1 or vy1 - vy0 < 1: return
    sw, sh = spr.size
    box = ((vx0 - L) / (R - L) * sw, (vy0 - T_) / (B - T_) * sh, (vx1 - L) / (R - L) * sw, (vy1 - T_) / (B - T_) * sh)
    out = spr.resize((max(1, int(round(vx1 - vx0))), max(1, int(round(vy1 - vy0)))), Image.BILINEAR if (R - L) > sw else Image.LANCZOS, box=box)
    if alpha < 1: out.putalpha(out.getchannel('A').point(lambda p: int(p * alpha)))
    im.paste(out, (int(round(vx0)), int(round(vy0))), out)


def _sombra():
    s = Image.new('L', (400, 120), 0); ImageDraw.Draw(s).ellipse([20, 30, 380, 90], fill=150)
    s = s.filter(ImageFilter.GaussianBlur(14)); out = Image.new('RGBA', s.size, (40, 30, 20, 0)); out.putalpha(s); return out
SP['sombra'] = _sombra()


def sombra(im, v, x, w):
    cola(im, v, 'sombra', rect=(x - w * 0.6, x + w * 0.6, -w * 0.1, w * 0.1))


def _chao():
    a = np.random.default_rng(1).random((H * SS // 8, W * SS // 8)).astype(np.float32)
    n = np.asarray(Image.fromarray(a).resize((W * SS, H * SS), Image.BICUBIC))
    f = np.random.default_rng(2).random((H * SS, W * SS)).astype(np.float32)
    base = np.array([214, 188, 140], np.float32)
    c = base[None, None] * (0.86 + 0.18 * n[..., None] + 0.08 * f[..., None])
    grad = np.linspace(1.0, 0.82, H * SS)[:, None, None]
    return Image.fromarray(np.clip(c * grad, 0, 255).astype(np.uint8))
CHAO = _chao()


def noite_papel():
    im = Image.new('RGB', (W * SS, H * SS), NOITE); d = ImageDraw.Draw(im)
    for x in range(30, W, 54): d.line([(x * SS, 0), (x * SS, H * SS)], fill=(30, 38, 70), width=SS)
    for y in range(30, H, 54): d.line([(0, y * SS), (W * SS, y * SS)], fill=(30, 38, 70), width=SS)
    d.rectangle([88 * SS, 0, 90 * SS, H * SS], fill=(90, 50, 70))
    r = np.random.default_rng(5)
    for _ in range(260):
        x, y, s = r.uniform(0, W * SS), r.uniform(0, H * SS), r.uniform(1, 3.2)
        d.ellipse([x - s, y - s, x + s, y + s], fill=(200, 205, 230))
    return im
NOITE = (13, 17, 38)
PAPEL_NOITE = noite_papel()

ORB = [(5.8e10, (150, 140, 130)), (1.08e11, (230, 190, 110)), (1.5e11, (80, 150, 225)), (2.28e11, (210, 90, 50)),
       (7.78e11, (210, 160, 110)), (1.43e12, (230, 200, 120)), (2.87e12, (130, 210, 220)), (4.5e12, (70, 100, 210))]
SQ = 0.42
PLAN = []
for _r, _c in ORB:
    import sprites as _s
    PLAN.append(_s.esfera(_c, 40))


def d_sistema(im, v, t):
    d = ImageDraw.Draw(im)
    for i, (r, cor) in enumerate(ORB):
        rp = v.px(r)
        if rp < 3 or rp > 20000: continue
        n = max(40, min(400, int(rp / 2)))
        pts = [v.p(SUN[0] + r * math.cos(2 * math.pi * k / n), SUN[1] + SQ * r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        d.line(pts + [pts[0]], fill=(110, 130, 190), width=2 * SS)
    for i, (r, cor) in enumerate(ORB):
        rp = v.px(r)
        if rp < 3 or rp > 20000: continue
        a = t * (1.6 / math.sqrt((i + 1))) + i * 1.7
        x, y = v.p(SUN[0] + r * math.cos(a), SUN[1] + SQ * r * math.sin(a))
        rr = int((7 + (4 if i in (4, 5) else 0)) * SS)
        p = PLAN[i].resize((2 * rr, 2 * rr), Image.LANCZOS); im.paste(p, (int(x - rr), int(y - rr)), p)
        if i == 5:
            d.ellipse([x - rr * 1.8, y - rr * 0.5, x + rr * 1.8, y + rr * 0.5], outline=(220, 200, 150), width=SS * 2)


def desenha_mundo(im, v, t):
    Rt = v.px(R_E)
    cola(im, v, 'universo', alpha=min(1, max(0, (3000 - v.px(UNI_R)) / 1500)))
    if v.px(MW_R) < 5000: cola(im, v, 'via')
    d_sistema(im, v, t)
    # Sol: nunca menor que um pontinho brilhante
    if v.px(R_S) < 9:
        x, y = raw(v, *SUN); r = 9 * SS * 3
        cola(im, v, 'sol', rect=(SUN[0] - r / v.s, SUN[0] + r / v.s, SUN[1] - r / v.s, SUN[1] + r / v.s))
    elif v.px(R_S) < 2500:
        cola(im, v, 'sol')
    if Rt > 2500:
        _, gy = raw(v, 0, 0)
        if gy < H * SS:
            gy = max(0, int(gy)); im.paste(CHAO.crop((0, 0, W * SS, H * SS - gy)), (0, gy))
            ImageDraw.Draw(im).line([(0, gy), (W * SS, gy)], fill=(120, 100, 70), width=2 * SS)
    else:
        cola(im, v, 'terra')
    # objetos do chão
    if Rt > 2500:
        for nome, x, w in [('everest', E_X, 15000), ('cristo', C_X, 12), ('pessoa', P_X, 0.45), ('formiga', A_X, 4.6e-3), ('grao', G_X, 1e-3)]:
            pw = v.px(w)
            if pw < 0.6 or pw > (1500 if nome != 'everest' else 2400): continue
            sombra(im, v, x, w); cola(im, v, nome)


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
             (3, (C_X - 14.0, 30.6), 30, False),
             (4, CUME, 30, True),
             (5, (EARTH[0] + 1.25 * R_E, EARTH[1] + 0.9 * R_E), 30, False)]


# ---------------- texto ----------------
_cache = {}
def T(s, size, fill, stroke=6, bg=PAPER):
    k = (s, size, fill, stroke, bg)
    if k not in _cache:
        f = F(size); l, tp, r, b = f.getbbox(s)
        im = Image.new('RGBA', (r - l + 30 * SS, b - tp + 30 * SS), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((15 * SS - l, 15 * SS - tp), s, font=f, fill=fill, stroke_width=stroke * SS, stroke_fill=bg)
        _cache[k] = im
    return _cache[k]


def put(im, s, size, fill, y, x=None, alpha=1.0, esc=1.0, stroke=6, bg=PAPER):
    img = T(s, size, fill, stroke, bg)
    if esc != 1.0: img = img.resize((max(1, int(img.width * esc)), max(1, int(img.height * esc))), Image.LANCZOS)
    if alpha < 1:
        img = img.copy(); img.putalpha(img.getchannel('A').point(lambda p: int(p * alpha)))
    x = (W * SS - img.width) // 2 if x is None else x
    im.paste(img, (int(x), int(y * SS - (img.height - T(s, size, fill, stroke, bg).height) / 2)), img)


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
    noite = min(1, max(0, (1400 - v.px(R_E)) / 900))
    im = PAPEL.copy() if noite <= 0 else (PAPEL_NOITE.copy() if noite >= 1 else Image.blend(PAPEL, PAPEL_NOITE, noite))
    desenha_mundo(im, v, t)
    d = ImageDraw.Draw(im)
    bg = PAPER if noite < 0.5 else NOITE
    tinta = INK if noite < 0.5 else (240, 240, 250)
    azul = BLUE if noite < 0.5 else (140, 180, 255)
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
        put(im, lv[0], 62, azul, 110, bg=bg)
        put(im, '≈ ' + fmt(lv[1] * p, lv[2]) if lv[2] or lv[1] * p >= 1 else '≈ 0', 150, tinta, 175, bg=bg)
        put(im, lv[3], 60, tinta, 345, bg=bg)
        if lv[4]: put(im, lv[4], 56, ORANGE, 420, bg=bg, alpha=min(1, max(0, (t - tk - 0.5) / 0.3)))
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
    put(im, '@Cardeno_Amarelo', 46, (150, 140, 120) if noite < 0.5 else (120, 130, 170), wy, x=wx * SS, stroke=0)
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
