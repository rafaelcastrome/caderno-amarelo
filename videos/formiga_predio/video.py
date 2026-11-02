"""Formiga caindo de um prédio de 50 andares. Gera formiga_predio.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 20     -> só os quadros nesses segundos (prev_*.png)
Antes: python3 sprites.py (gera sprites/*.png).
Falas: falas/antonio/fala0..10.mp3 (Microsoft Antonio, gravado no PC do Rafael).
"""
import math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
SR = 24000; TEMPO = 1.08                  # fala um pouco mais rápida
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
UI = lambda s, b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if b else ''), s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 140, 70)
PAPER = (251, 245, 223); YEL = (245, 197, 24)
N_FALAS = 11


# ---------------- áudio ----------------
ARQS = list(range(10)) + [11, 12]        # fala10 antiga ("vive normalmente") saiu; 12 = a formiga falando


def carrega_falas():
    clips = []
    for i in ARQS:
        fino = f',asetrate={int(SR * 1.3)},aresample={SR},atempo={1 / 1.3:.4f}' if i == 12 else ''   # voz fininha da formiga
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'falas/antonio/fala{i}.mp3', '-af',
                            f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={TEMPO}' + fino,
                            '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
        clips.append(np.frombuffer(r, np.int16).astype(np.float32))
    return clips


GAP = [0.25, 0.35, 0.3, 0.25, 0.3, 0.3, 0.3, 1.0, 0.3, 0.35, 0.0]   # pausa depois de cada fala
FALA_FORMIGA = 6.4                                                 # quando a formiga fala (seg. dentro da fase D)
EXTRA0 = 0.7                                                       # formiga tomba antes da queda


def monta(d):
    ev = {}; t = 0.2
    for i in range(N_FALAS):
        if i == 2: t += EXTRA0
        if i == 8: t += 0.5                                          # chão chegando
        ev[i] = (t, t + d[i]); t += d[i] + GAP[i]
    fase = {'A': (0, ev[1][1] + GAP[1] + EXTRA0), 'B': (ev[1][1] + GAP[1] + EXTRA0, ev[8][0] - 0.5)}
    fase['C'] = (fase['B'][1], ev[10][0] + 0.9)
    d0 = fase['C'][1]
    ev[11] = (d0 + FALA_FORMIGA, d0 + FALA_FORMIGA + d[11])
    fase['D'] = (d0, ev[11][1] + 1.2)
    return ev, fase


# ---------------- utilidades de desenho ----------------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


_c = {}
def T(s, size, fill=INK, stroke=(255, 255, 255), sw=7):
    k = (s, size, fill, stroke, sw)
    if k not in _c:
        f = F(size); l, t, r, b = f.getbbox(s)
        im = Image.new('RGBA', (r - l + 30, b - t + 40), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((15 - l, 15 - t), s, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke)
        _c[k] = im
    return _c[k]


def texto(im, s, size, fill, y, x=None, box=True):
    img = T(s, size, fill); x = (W - img.width) // 2 if x is None else x
    if box:
        ImageDraw.Draw(im).rounded_rectangle([x - 12, y - 8, x + img.width + 12, y + img.height + 4], 26, fill=(255, 255, 255), outline=INK, width=5)
    im.paste(img, (x, y), img)


def pop(t, t0, dur=0.25):
    """escala 'pop' 0->1.1->1"""
    a = (t - t0) / dur
    if a <= 0: return 0
    if a >= 1: return 1
    return 1.1 * math.sin(a * math.pi / 2) + (0 if a < 0.7 else -0.1 * (a - 0.7) / 0.3)


def card(im, box, fill=(255, 255, 255)):
    ImageDraw.Draw(im).rounded_rectangle(box, 34, fill=fill, outline=INK, width=6)


def carrega(n, crop=True):
    im = Image.open(f'sprites/{n}.png').convert('RGBA')
    return im.crop(im.getbbox()) if crop else im


_esc = {}
def esc(im, k, key):
    kk = (key, round(k, 3))
    if kk not in _esc: _esc[kk] = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
    return _esc[kk]


_rot = {}
def gira(im, ang, key):
    kk = (key, int(round(ang)) % 360)
    if kk not in _rot: _rot[kk] = im.rotate(kk[1], Image.BICUBIC, expand=True)
    return _rot[kk]


def cola_centro(dst, im, cx, cy):
    dst.paste(im, (int(cx - im.width / 2), int(cy - im.height / 2)), im)


def sombra(im, cx, cy, rx, ry, a=90):
    lay = Image.new('RGBA', (int(rx * 2 + 40), int(ry * 2 + 40)), (0, 0, 0, 0))
    ImageDraw.Draw(lay).ellipse([20, 20, 20 + rx * 2, 20 + ry * 2], fill=(0, 0, 0, a))
    lay = lay.filter(ImageFilter.GaussianBlur(10))
    im.paste(lay, (int(cx - rx - 20), int(cy - ry - 20)), lay)


ANDA = [carrega(f'anda{k}', False) for k in range(8)]          # 1000x700, pés em y~544
ANDA_C = [a.crop((40, 40, 960, 600)) for a in ANDA]             # pés em y ~504
CIMA = [carrega('cima0'), carrega('cima1')]
SENTADA = carrega('sentada', False)
FACHADA = Image.open('sprites/fachada.png').convert('RGB')
PREDIO = carrega('predio')
CHAO = Image.open('sprites/chao.png').convert('RGB')
PESSOA = carrega('pessoa')
ARVORE = carrega('arvore')
ANDAR = 150
PAPEL = paper()
WM = T('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=PAPER, sw=0)


def formiga_lado(fase, k, ang=0):
    a = esc(ANDA_C[int(fase * 8) % 8], k, ('anda', int(fase * 8) % 8))
    return gira(a, ang, ('al', int(fase * 8) % 8, round(k, 3))) if ang else a


# ---------------- fase A: o prédio e a formiga na beirada ----------------
def fase_a(t, ev, fase):
    im = PAPEL.copy(); d = ImageDraw.Draw(im)
    # chão da cidade
    d.rectangle([0, 1820, W, H], fill=(170, 166, 160)); d.line([(0, 1820), (W, 1820)], fill=INK, width=5)
    im.paste(PREDIO, (120, 1820 - PREDIO.height), PREDIO)
    top = 1820 - PREDIO.height + 30
    # régua 50 andares
    d.line([(395, top), (395, 1815)], fill=RED, width=6)
    for y in (top, 1815): d.line([(375, y), (415, y)], fill=RED, width=6)
    lab = T('50 andares', 64, RED); lab = lab.rotate(90, expand=True); im.paste(lab, (410, (top + 1815) // 2 - lab.height // 2), lab)
    # círculo na formiguinha
    cx, cy = 215, top - 8
    d.ellipse([cx - 34, cy - 34, cx + 34, cy + 34], outline=RED, width=6)
    # zoom: beirada do prédio
    bx0, by0, bx1, by1 = 470, 330, 1040, 1010
    d.line([(cx + 34, cy), (bx0, by0 + 300)], fill=RED, width=5)
    card(im, (bx0, by0, bx1, by1), fill=(214, 232, 242))
    z = Image.new('RGBA', (bx1 - bx0 - 12, by1 - by0 - 12), (214, 232, 242, 255)); dz = ImageDraw.Draw(z)
    # laje e parapeito vistos de lado + fachada embaixo
    fz = FACHADA.crop((0, 0, 520, 600)).resize((300, 346))
    z.paste(fz, (-20, 420)); dz.rectangle([-20, 380, 280, 420], fill=(150, 146, 140)); dz.line([(-20, 380), (280, 380)], fill=INK, width=4)
    dz.line([(280, 380), (280, 800)], fill=INK, width=4)
    # formiga andando até a beirada (x=280)
    a0, a1 = fase['A']
    k = 0.3
    walk_end = a1 - EXTRA0
    x = 40 + (min(t, walk_end) - a0) / (walk_end - a0) * 170
    if t < walk_end:
        f = formiga_lado(t * 1.6, k)
        z.paste(f, (int(x), int(380 - 504 * k)), f)
    else:
        u = (t - walk_end) / EXTRA0                                   # tomba e cai
        ang = -min(90, u * 160); dy = max(0, u - 0.35) ** 2 * 900
        f = esc(ANDA_C[0], k, ('anda', 0)); f = gira(f, ang, ('tomb', k))
        z.paste(f, (int(x + u * 60), int(380 - 504 * k + dy - (f.height - 504 * k) * 0.3)), f)
    im.paste(z, (bx0 + 6, by0 + 6))
    d.rounded_rectangle((bx0, by0, bx1, by1), 34, outline=INK, width=6)
    texto(im, 'Formiga x prédio', 112, INK, 60)
    if t >= ev[1][0]:
        s = pop(t, ev[1][0])
        if s > 0:
            img = T('Será que ela sobrevive?', 70, RED); img = esc(img, s, ('pop1', ))if s < 1 else img
            ImageDraw.Draw(im).rounded_rectangle([470, 1040, 1040, 1040 + 150], 26, fill=(255, 255, 255), outline=INK, width=5)
            im.paste(img, (755 - img.width // 2, 1115 - img.height // 2), img)
    return im


# ---------------- fase B: a queda ----------------
def caido(t, fase):
    """andares percorridos"""
    b0, b1 = fase['B']
    u = (t - b0) / (b1 - b0)
    return 44.0 * (u - 0.08 * math.sin(u * math.pi) * 0)  # linear (velocidade terminal constante)


def velocidade(t, fase):
    s = t - fase['B'][0]
    return 6.4 * (1 - math.exp(-s / 0.25)) if s > 0 else 0.0


ANT_X, ANT_Y = 790, 760


def cena_queda(t, ev, fase, caidos, ant_y=ANT_Y, mostra_ant=True):
    im = PAPEL.copy(); d = ImageDraw.Draw(im)
    off = caidos * ANDAR
    y_row0 = ANT_Y - off + 120                                       # topo do prédio
    y0 = int(max(0, -y_row0)); y1 = int(min(FACHADA.height, H - y_row0))
    if y1 > y0:
        im.paste(FACHADA.crop((0, y0, 520, y1)), (0, int(y_row0 + y0)))
    if y_row0 > 0:
        d.rectangle([0, y_row0 - 26, 530, y_row0], fill=(150, 146, 140), outline=INK, width=4)
    # números dos andares na fachada
    for n in range(1, 51):
        yy = y_row0 + (50 - n) * ANDAR + ANDAR // 2
        if -60 < yy < H + 60 and n % 5 == 0:
            img = T(f'{n}º', 54, INK); im.paste(img, (520 + 8, int(yy - img.height // 2)), img)
    # chão
    yg = y_row0 + 50 * ANDAR
    if yg < H:
        im.paste(CHAO, (0, int(yg)))
        d.line([(0, yg), (W, yg)], fill=INK, width=5)
    # vento (riscos subindo em volta da formiga)
    if mostra_ant:
        forte = 1.0
        for i in range(14):
            rx = ANT_X - 230 + (i * 137) % 460
            ph = (t * (900 + 60 * (i % 5)) + i * 211) % 900
            ry = ant_y + 420 - ph
            ln = 60 + 30 * (i % 3)
            if abs(rx - ANT_X) < 160 and abs(ry - ant_y) < 200: continue
            d.line([(rx, ry), (rx, ry + ln)], fill=(150, 175, 195), width=5)
        wob = 14 * math.sin(t * 2.3) + 6 * math.sin(t * 5.1)
        a = CIMA[int(t * 6) % 2]
        a = esc(a, 0.42, ('cima', int(t * 6) % 2))
        a = gira(a, wob, ('cimag', int(t * 6) % 2))
        cola_centro(im, a, ANT_X + 10 * math.sin(t * 1.3), ant_y)
    return im


def hud(im, t, fase, caidos):
    v = velocidade(t, fase)
    card(im, (580, 70, 1050, 380))
    s = f'{v:.1f}'.replace('.', ',')
    img = T(s, 150, RED, sw=0); im.paste(img, (600, 60), img)
    img = T('km/h', 70, INK, sw=0); im.paste(img, (900, 140), img)
    andar = max(1, 50 - int(caidos))
    seg = caidos / 50 * 83 + min(0.5, t - fase['B'][0])
    img = T(f'andar {andar}', 64, INK, sw=0); im.paste(img, (605, 225), img)
    img = T(f'queda: {int(seg)} s', 64, BLUE, sw=0); im.paste(img, (605, 290), img)
    img = T('acelerado', 40, (130, 120, 100), sw=0); im.paste(img, (900, 312), img)


def inset_pessoa_andando(im, t, t0):
    s = pop(t, t0)
    if s <= 0: return
    box = Image.new('RGBA', (480, 460), (0, 0, 0, 0)); card(box, (3, 3, 476, 456))
    p = esc(PESSOA, 0.5, 'p05'); dx = int((t * 120) % 140)
    box.paste(p, (60 + dx, 80), p)
    ImageDraw.Draw(box).line([(30, 80 + p.height), (450, 80 + p.height)], fill=INK, width=4)
    img = T('6 km/h = andando', 56, GREEN, sw=0); box.paste(img, (240 - img.width // 2, 10), img)
    box = esc(box, s, ('ip', round(s, 2))) if s < 1 else box
    cola_centro(im, box, 800, 1330)


def inset_pessoa_caindo(im, t, t0):
    s = pop(t, t0)
    if s <= 0: return
    box = Image.new('RGBA', (480, 460), (0, 0, 0, 0)); card(box, (3, 3, 476, 456))
    p = gira(esc(PESSOA, 0.42, 'p04'), 90 + 6 * math.sin(t * 9), 'pc')
    cola_centro(box, p, 240 + 8 * math.sin(t * 13), 250)
    dd = ImageDraw.Draw(box)
    for i in range(7):
        x = 60 + i * 60; ph = (t * 1800 + i * 97) % 300
        dd.line([(x, 440 - ph), (x, 440 - ph + 90)], fill=(160, 160, 170), width=4)
    img = T('tu: 155 km/h', 64, RED, sw=0); box.paste(img, (240 - img.width // 2, 8), img)
    box = esc(box, s, ('ipc', round(s, 2))) if s < 1 else box
    cola_centro(im, box, 800, 1330)


def inset_arvore(im, t, t0):
    s = pop(t, t0)
    if s <= 0: return
    box = Image.new('RGBA', (480, 560), (0, 0, 0, 0)); card(box, (3, 3, 476, 556), fill=(225, 240, 220))
    a = esc(ARVORE, 0.6, 'arv'); box.paste(a, (40, 6), a)
    dd = ImageDraw.Draw(box)
    for k in range(9):                                               # folhas
        dd.ellipse([10 + k * 50, -30 + (k % 3) * 18, 90 + k * 50, 50 + (k % 3) * 18], fill=(70, 140, 60))
    # caminho: cai, vira e plana de ré até o tronco
    u = min(1, max(0, (t - t0 - 0.3) / 3.2))
    pts = []
    for i in range(40):
        q = i / 39
        x = 150 + 260 * math.sin(q * math.pi) * (1 - q * 0.35) if q < 0.999 else 190
        y = 90 + 380 * q
        pts.append((x, y))
    n = max(2, int(u * 40))
    for i in range(0, n - 1, 2): dd.line([pts[i], pts[i + 1]], fill=RED, width=5)
    fx, fy = pts[n - 1]
    f = gira(esc(CIMA[0], 0.12, 'c012'), 200 - 120 * u, 'arvf')
    cola_centro(box, f, fx, fy)
    img = T('plana de ré!', 56, RED, sw=0); box.paste(img, (470 - img.width, 480), img)
    box = esc(box, s, ('ia', round(s, 2))) if s < 1 else box
    cola_centro(im, box, 800, 1360)


def fase_b(t, ev, fase):
    c = caido(t, fase)
    im = cena_queda(t, ev, fase, c)
    hud(im, t, fase, c)
    if ev[2][0] + 1.0 <= t < ev[3][0]:
        texto(im, 'parou de acelerar!', 90, RED, 1650)
    if ev[3][0] <= t < ev[4][0]:
        inset_pessoa_andando(im, t, ev[3][0] + 1.3)
    if ev[4][0] <= t < ev[5][0]:
        inset_pessoa_caindo(im, t, ev[4][0])
    if ev[5][0] <= t < ev[6][0]:
        d = ImageDraw.Draw(im)
        for i, x in enumerate((ANT_X - 150, ANT_X, ANT_X + 150)):         # setas do ar
            y = ANT_Y + 330 - 25 * math.sin(t * 6 + i)
            d.line([(x, y + 130), (x, y)], fill=BLUE, width=12)
            d.polygon([(x - 34, y + 10), (x + 34, y + 10), (x, y - 40)], fill=BLUE)
        texto(im, 'o ar segura ela!', 96, BLUE, 1650)
    if ev[6][0] <= t < ev[7][0]:
        texto(im, 'mais de 1 minuto caindo!', 84, INK, 1650)
    if ev[7][0] <= t:
        inset_arvore(im, t, ev[7][0])
        if t >= ev[7][0] + 0.8: texto(im, 'formiga planadora', 84, GREEN, 1700)
    return im


# ---------------- fase C: chão, e nada, sai andando ----------------
GROUND = 1380


def fase_c(t, ev, fase):
    c0 = fase['C'][0]; t_imp = c0 + 0.5
    c_final = 50 - (GROUND - (ANT_Y + 120)) / ANDAR
    c_ini = caido(c0, fase)
    if t < t_imp:
        u = (t - c0) / 0.5
        c = c_ini + (c_final - c_ini) * u
        im = cena_queda(t, ev, fase, c, ant_y=ANT_Y + (GROUND - 60 - ANT_Y) * u ** 1.5)
        hud(im, t, fase, c)
        return im
    im = cena_queda(t, ev, fase, c_final, mostra_ant=False)
    d = ImageDraw.Draw(im)
    k = 0.5; fx = ANT_X - 230
    s9 = ev[9][0]
    if t < s9 + 0.9:                                                   # de costas, perninhas mexendo
        fl = esc(ANDA_C[int(t * 12) % 8], k, ('anda', int(t * 12) % 8)); fl = gira(fl, 180, ('costas', int(t * 12) % 8))
        if t >= s9 + 0.4:
            ang = 180 + (t - s9 - 0.4) / 0.5 * 180
            fl = gira(esc(ANDA_C[0], k, ('anda', 0)), ang, ('vira',))
        sombra(im, fx + fl.width / 2, GROUND + 6, 200, 18)
        im.paste(fl, (int(fx), int(GROUND - fl.height + 10)), fl)
        x_ant = fx
    else:                                                              # sai andando
        tw = t - (s9 + 0.9)
        x_ant = fx + tw * 40 + 700 * max(0, t - ev[10][0]) ** 1.5        # e vai direto...
        fl = formiga_lado(tw * (1.8 if t < ev[10][0] else 3.5), k)
        sombra(im, x_ant + fl.width / 2, GROUND + 6, 200, 18)
        im.paste(fl, (int(x_ant), int(GROUND - 504 * k)), fl)
    # poeirinha e TUC
    if t_imp <= t < t_imp + 0.6:
        u = (t - t_imp) / 0.6
        for i in range(8):
            ang = math.pi * (i / 7)
            r = 60 + 160 * u; x = ANT_X + math.cos(ang) * r * 1.4; y = GROUND - math.sin(ang) * r * 0.5
            rr = 26 * (1 - u) + 6
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(190, 182, 170))
        texto(im, 'tuc', 80, INK, GROUND - 330, x=ANT_X + 120, box=False)
    if t >= ev[8][0] + 1.2 and t < ev[9][0]:
        texto(im, 'e nada!', 120, GREEN, 1650)
    if ev[9][0] <= t < ev[10][0]:
        texto(im, 'armadura natural', 96, BLUE, 1650)
        d.line([(ANT_X - 40, GROUND - 330), (x_ant + 150, GROUND - 150)], fill=BLUE, width=6)
        img = T('exoesqueleto', 64, BLUE); im.paste(img, (ANT_X - 220, GROUND - 400), img)
    return im


# ---------------- fase D: a virada (formiga no Instagram do Caderno) ----------------
PH = (440, 560, 1050, 1640)          # celular
SC = (PH[0] + 26, PH[1] + 70, PH[2] - 26, PH[3] - 70)
SW, SH = SC[2] - SC[0], SC[3] - SC[1]


def almofada():
    from base3d import Cena3D, reduz
    c = Cena3D(1400, 500)
    c.capsula(260, 300, 1140, 300, 190, 190, 0, (245, 197, 24), 0.25, 0.5)
    return reduz(c.render(amb=0.45, dif=0.65))


ALMOF = almofada()


def tela_perfil(seguindo, toque=None):
    return _tela_perfil(seguindo, toque).resize((SW, SH), Image.LANCZOS)


SW0, SH0 = 478, 820


def _tela_perfil(seguindo, toque=None):
    SW, SH = SW0, SH0
    s = Image.new('RGB', (SW, SH), (255, 255, 255)); d = ImageDraw.Draw(s)
    d.text((18, 10), '21:40', font=UI(22, True), fill=INK)
    d.text((18, 52), 'Cardeno_Amarelo', font=UI(30, True), fill=INK)
    d.line([(0, 100), (SW, 100)], fill=(225, 225, 225), width=2)
    # avatar: caderninho amarelo
    d.ellipse([18, 120, 148, 250], fill=YEL, outline=(230, 120, 60), width=6)
    d.rectangle([58, 150, 108, 220], fill=(255, 240, 170), outline=INK, width=3)
    for y in range(162, 215, 12): d.line([(64, y), (102, y)], fill=(150, 170, 200), width=2)
    d.text((170, 140), 'Caderno Amarelo', font=UI(28, True), fill=INK)
    d.text((170, 180), 'curiosidades, desafios', font=UI(22), fill=(90, 90, 90))
    d.text((170, 208), 'e memes no papel', font=UI(22), fill=(90, 90, 90))
    b = (18, 272, SW - 18, 330)
    if seguindo:
        d.rounded_rectangle(b, 12, fill=(235, 235, 235)); lab = 'Seguindo ✓'; cor = INK
    else:
        d.rounded_rectangle(b, 12, fill=(0, 120, 230)); lab = 'Seguir'; cor = (255, 255, 255)
    f = UI(28, True); w = d.textlength(lab, font=f)
    d.text(((b[0] + b[2]) / 2 - w / 2, 284), lab, font=f, fill=cor)
    # grade de vídeos
    gw = (SW - 8) // 3; gh = int(gw * 1.55); y0 = 350
    temas = [('formiga', (214, 232, 242)), ('fala a cor', PAPER), ('bandeira', PAPER), ('elefante', PAPER), ('corpo', PAPER), ('responde', PAPER)]
    for i, (nome, bg) in enumerate(temas):
        x = (i % 3) * (gw + 4); y = y0 + (i // 3) * (gh + 4)
        d.rectangle([x, y, x + gw, y + gh], fill=bg)
        if nome == 'formiga':
            p = esc(PREDIO, 0.13, 'pmini'); s.paste(p, (x + 20, y + gh - p.height), p)
            a = esc(CIMA[0], 0.07, 'cmini'); s.paste(a, (x + 80, y + 60), a)
        elif nome == 'fala a cor':
            for j, (w_, c) in enumerate([('AZUL', RED), ('VERDE', BLUE), ('ROXO', GREEN)]):
                d.text((x + 16, y + 40 + j * 50), w_, font=F(48), fill=c)
        elif nome == 'bandeira':
            for j, c in enumerate([(0, 160, 160), (20, 20, 20), (250, 120, 40)]):
                d.rectangle([x + 20 + j * 34, y + 70, x + 54 + j * 34, y + 150], fill=c)
        elif nome == 'elefante':
            d.ellipse([x + 30, y + 70, x + 120, y + 150], fill=(150, 150, 160)); d.line([(x + 40, y + 120), (x + 30, y + 190)], fill=(150, 150, 160), width=18)
        elif nome == 'corpo':
            d.ellipse([x + 60, y + 50, x + 100, y + 90], fill=(232, 182, 140)); d.line([(x + 80, y + 90), (x + 80, y + 170)], fill=INK, width=8)
        else:
            d.text((x + 30, y + 60), '?', font=F(130), fill=RED)
        d.text((x + 8, y + gh - 30), '▶', font=UI(20), fill=(255, 255, 255) if nome == 'formiga' else (120, 120, 120))
    if toque:
        tx, ty, u = toque
        r = 20 + 50 * u
        lay = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(lay).ellipse([tx - r, ty - r, tx + r, ty + r], fill=(120, 120, 120, int(110 * (1 - u))))
        s.paste(lay, (0, 0), lay)
    return s


def tela_video(t, ev, fase, tv):
    fr = fase_a(min(fase['A'][1] - 0.01, fase['A'][0] + tv), ev, fase)
    return fr.resize((SW, int(SW * H / W)), Image.LANCZOS).crop((0, 0, SW, SH))


def fase_d(t, ev, fase):
    d0 = fase['D'][0]; u = t - d0
    im = PAPEL.copy(); d = ImageDraw.Draw(im)
    d.rectangle([0, 1500, W, H], fill=(205, 170, 120)); d.line([(0, 1500), (W, 1500)], fill=INK, width=5)   # mesa / chão
    sombra(im, 420, 1520, 440, 30, 70)
    im.paste(ALMOF, (-300, 1150), ALMOF)
    ENTRA = 1.8
    if u < ENTRA:                                                      # chega andando, direto pro celular
        k = 0.62; fl = formiga_lado(u * 3.5, k)
        x = -620 + 560 * min(1, u / (ENTRA - 0.2))
        sombra(im, x + fl.width / 2, 1500, 220, 16)
        im.paste(fl, (int(x), int(1500 - 504 * k)), fl)
    else:                                                              # formiga sentada (de lado, olhando o celular)
        k = 0.7
        a = esc(SENTADA, k, 'sent')
        bob = 4 * math.sin(u * 3) + (10 * math.sin(u * 22) if u > 5.0 else 0)   # treme de rir
        im.paste(a, (-170, int(820 + bob)), a)
    u = u - ENTRA
    # celular
    d.rounded_rectangle(PH, 60, fill=(25, 25, 30), outline=(5, 5, 5), width=4)
    d.rounded_rectangle((PH[0] + 8, PH[1] + 8, PH[2] - 8, PH[3] - 8), 54, outline=(80, 80, 90), width=3)
    d.rounded_rectangle(((PH[0] + PH[2]) // 2 - 50, PH[1] + 28, (PH[0] + PH[2]) // 2 + 50, PH[1] + 44), 8, fill=(50, 50, 55))
    if u < 0:
        scr = Image.new('RGB', (SW, SH), (15, 15, 20)); dd = ImageDraw.Draw(scr)
        dd.text((SW / 2 - 80, 300), '21:40', font=UI(64, True), fill=(230, 230, 230))
    elif u < 1.6:
        scr = tela_perfil(False)
    elif u < 2.0:
        scr = tela_perfil(False, (SW0 / 2, 300, (u - 1.6) / 0.4))
    elif u < 2.7:
        scr = tela_perfil(True)
    elif u < 3.0:
        gw = (SW0 - 8) // 3
        scr = tela_perfil(True, (gw / 2, 350 + gw * 0.77, (u - 2.7) / 0.3))
    else:
        scr = tela_video(t, ev, fase, u - 3.0)
    im.paste(scr, (SC[0], SC[1]))
    # patinhas por cima da borda do celular
    if u >= 0:
        for yy in (1040, 1110):
            d.ellipse([PH[0] - 22, yy - 20, PH[0] + 26, yy + 22], fill=(70, 28, 15))
    if u >= 2.0:                                                       # coraçõezinhos subindo (feliz da vida)
        for i in range(7):
            ph = ((u - 2.0) * 0.55 + i / 7) % 1
            hx = 250 + 90 * math.sin(i * 2.1 + u * 2) + i * 8; hy = 980 - ph * 520; r = 20 + 10 * (i % 3)
            cor = (230, 60, 90)
            d.ellipse([hx - r, hy - r, hx, hy]); d.ellipse([hx - r, hy - r, hx, hy], fill=cor); d.ellipse([hx, hy - r, hx + r, hy], fill=cor)
            d.polygon([(hx - r, hy - r / 2 + 2), (hx + r, hy - r / 2 + 2), (hx, hy + r)], fill=cor)
    if 3.2 <= u < FALA_FORMIGA - 1.8:
        img = T('kkkkkk', 96, RED, sw=0); im.paste(img, (40 + int(8 * math.sin(u * 30)), 520), img)
    if u >= FALA_FORMIGA - 1.8:                                        # balão: a formiga chama a galera
        s = pop(t, d0 + ENTRA + FALA_FORMIGA - 1.8)
        if s > 0:
            bal = Image.new('RGBA', (1000, 400), (0, 0, 0, 0)); bd = ImageDraw.Draw(bal)
            bd.rounded_rectangle([10, 10, 990, 300], 60, fill=(255, 255, 255), outline=INK, width=7)
            bd.polygon([(170, 292), (260, 292), (150, 390)], fill=(255, 255, 255), outline=INK)
            bd.line([(172, 296), (258, 296)], fill=(255, 255, 255), width=10)
            l1 = T('Segue o Caderno Amarelo', 84, INK, sw=0); l2 = T('@Cardeno_Amarelo', 90, RED, sw=0)
            bal.paste(l1, (500 - l1.width // 2, 30), l1); bal.paste(l2, (500 - l2.width // 2, 150), l2)
            if s < 1: bal = esc(bal, s, ('bal', round(s, 2)))
            im.paste(bal, (540 - bal.width // 2, 150), bal)
    if 2.0 <= u < 3.2:
        s = pop(t, d0 + 2.0)
        img = T('seguiu!', 90, RED)
        if s < 1 and s > 0: img = esc(img, s, ('seg',))
        if s > 0: im.paste(img, (230 - img.width // 2, 700 - img.height // 2), img)
    return im


def frame(t, ev, fase):
    if t < fase['A'][1]: im = fase_a(t, ev, fase); wmp = (560, 1845)
    elif t < fase['B'][1]: im = fase_b(t, ev, fase); wmp = [(560, 1845), (120, 1845), (120, 30)][int(t // 6) % 3]
    elif t < fase['C'][1]: im = fase_c(t, ev, fase); wmp = (130, 30)
    else: im = fase_d(t, ev, fase); wmp = [(560, 30), (130, 30)][int(t // 3) % 2]
    im.paste(WM, wmp, WM)
    return im


# ---------------- efeitos sonoros simples ----------------
def sfx(total, ev, fase):
    a = np.zeros(int(total * SR), np.float32); rng = np.random.default_rng(1)
    def add(t0, x):
        i = int(t0 * SR); a[i:i + len(x)] += x[:len(a) - i]
    # vento na queda
    b0, b1 = fase['B'][0], fase['C'][0] + 0.5
    n = rng.standard_normal(int((b1 - b0) * SR)).astype(np.float32)
    k = np.ones(400) / 400; n = np.convolve(n, k, 'same') * 4000
    env = np.minimum(1, np.minimum(np.arange(len(n)) / SR / 0.6, (len(n) - np.arange(len(n))) / SR / 0.3))
    add(b0, n * env * 0.9)
    # tuc no chão
    tt = np.arange(int(0.25 * SR)) / SR
    add(fase['C'][0] + 0.5, 9000 * np.sin(2 * math.pi * 110 * tt) * np.exp(-tt * 25))
    # toques no celular
    d0 = fase['D'][0]
    tc = np.arange(int(0.05 * SR)) / SR
    clk = 6000 * np.sin(2 * math.pi * 1800 * tc) * np.exp(-tc * 120)
    d0 += 1.8
    add(d0 + 1.6, clk); add(d0 + 2.7, clk)
    # "plim" do seguir
    tp = np.arange(int(0.4 * SR)) / SR
    add(d0 + 1.65, 3500 * (np.sin(2 * math.pi * 1320 * tp) + 0.6 * np.sin(2 * math.pi * 1760 * tp)) * np.exp(-tp * 9))
    return a


def main():
    clips = carrega_falas()
    dur = [len(c) / SR for c in clips]
    ev, fase = monta(dur)
    DUR = fase['D'][1]
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, ev, fase).save(f'prev_{s}.png')
        print({k: (round(a, 2), round(b, 2)) for k, (a, b) in ev.items()}, fase, 'DUR', DUR); return
    full = np.zeros(int(DUR * SR) + SR, np.float32)
    for i, c in enumerate(clips):
        i0 = int(ev[i][0] * SR); full[i0:i0 + len(c)] += c[:len(full) - i0]
    # no fim, o vídeo no celular começa de novo (fala0 baixinha, som de celular) -> loop
    c0 = clips[0]; tv0 = fase['D'][0] + 1.8 + 3.0 + 0.2              # vídeo no celular, baixinho, até a formiga falar
    i0 = int(tv0 * SR); seg = c0[:max(0, int((ev[11][0] - 0.2 - tv0) * SR))]
    seg = np.convolve(seg, np.array([1, -0.9], np.float32), 'same') * 0.3
    full[i0:i0 + len(seg)] += seg
    full = full[:int(DUR * SR)]
    full += sfx(DUR, ev, fase)[:len(full)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'formiga_predio.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, ev, fase).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
