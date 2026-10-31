"""Leitura rápida: uma palavra por vez (RSVP). Gera leitura_rapida.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, math, re, sys, wave
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
TEMPO = 1.08                      # acelera um pouco a voz
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
PAPER = (251, 245, 223); YEL = (245, 197, 24)

# ---------- áudio: falas cortadas do take único ----------
# (início, fim) de cada fala no falas/take1.wav (cortes no meio dos silêncios)
FALAS = [(0.30, 3.40), (4.00, 8.05), (8.55, 13.90), (15.00, 21.55),
         (22.80, 25.30), (26.40, 29.05), (30.25, 38.60)]


def silencios():
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'falas/take1.wav', '-af',
                          'silencedetect=n=-40dB:d=0.25', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return list(zip(ss, se))


def carrega_falas():
    with wave.open('falas/take1.wav') as w:
        sr = w.getframerate(); pcm = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    sil = silencios(); clips = []
    for a, b in FALAS:
        partes = []; cur = a
        for s, e in sil:            # pausa interna longa vira 0.28 s
            if s > a + 0.05 and e < b - 0.05 and e - s > 0.3:
                partes.append(pcm[int(cur * sr):int((s + 0.14) * sr)]); cur = e - 0.14
        partes.append(pcm[int(cur * sr):int(b * sr)])
        clips.append(np.concatenate(partes))
    return sr, clips


# ---------- textos do teste ----------
NIVEIS = [  # (palavras por minuto, quadros por palavra, frase)
    (300, 6, 'Se tu tá lendo isso, teu cérebro tá indo muito bem até agora.'),
    (450, 4, 'Viu? Mais rápido e tu continua entendendo tudo, porque teu cérebro é mais rápido que teu olho.'),
    (600, 3, 'Teu olho nem tá se mexendo, ele fica parado enquanto o cérebro faz todo o trabalho sozinho.'),
    (900, 2, 'Se tu conseguiu ler essa frase inteira, comenta a palavra pipoca aqui embaixo.'),
]


def seq_palavras(frase, q):
    """lista de (palavra, quadros); pontuação ganha um quadro a mais nos níveis lentos"""
    out = []
    for p in frase.split():
        n = q + (q // 2 if p[-1] in ',.?!' and q > 2 else 0)
        out.append((p, n))
    return out


# ---------- linha do tempo ----------
def monta_linha(dur_falas):
    ev = []; t = 0.15
    def fala(i, gap=0.12):
        nonlocal t
        ev.append(('fala', i, t, t + dur_falas[i])); t += dur_falas[i] + gap
    def teste(n):
        nonlocal t
        t += 0.25                                  # meio segundo de foco
        q = NIVEIS[n][1]; fr = sum(k for _, k in seq_palavras(NIVEIS[n][2], q))
        ev.append(('teste', n, t, t + fr / FPS)); t += fr / FPS + 0.3
    fala(0); fala(1); fala(2, 0.0); teste(0); fala(3, 0.0); teste(1); fala(4, 0.0); teste(2)
    fala(5, 0.0); teste(3); t += 0.2; fala(6, 0.0)
    return ev, t + 0.45


# ---------- desenho ----------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


BX0, BY0, BX1, BY1 = 70, 700, 1010, 1060          # tela de leitura
CXW, CYW = 540, 880                                # ponto de mira


def arte_2x(desenha, box):
    """desenha numa camada 2x e reduz (antialias). box=(x0,y0,x1,y1) em 1x"""
    x0, y0, x1, y1 = box
    lay = Image.new('RGBA', ((x1 - x0) * 2, (y1 - y0) * 2), (0, 0, 0, 0))
    desenha(ImageDraw.Draw(lay), lambda x, y: ((x - x0) * 2, (y - y0) * 2))
    return lay.resize((x1 - x0, y1 - y0), Image.LANCZOS)


def base_img():
    im = paper()
    def tela(d, P):
        a = P(BX0, BY0); b = P(BX1, BY1)
        d.rounded_rectangle([a[0] + 10, a[1] + 14, b[0] + 10, b[1] + 14], 70, fill=(0, 0, 0, 40))
        d.rounded_rectangle([a, b], 70, fill=(255, 255, 255, 255), outline=INK, width=10)
        for y0, y1 in [(BY0 + 50, BY0 + 105), (BY1 - 105, BY1 - 50)]:     # risquinhos de mira
            d.line([P(CXW, y0), P(CXW, y1)], fill=RED, width=10)
        d.line([P(BX0 + 60, BY0 + 78), P(BX1 - 60, BY0 + 78)], fill=(215, 215, 215), width=4)
        d.line([P(BX0 + 60, BY1 - 78), P(BX1 - 60, BY1 - 78)], fill=(215, 215, 215), width=4)
    lay = arte_2x(tela, (BX0 - 20, BY0 - 20, BX1 + 40, BY1 + 40))
    im.paste(lay, (BX0 - 20, BY0 - 20), lay)
    for (x, y, a) in [(140, BY0, -20), (940, BY0, 20)]:                 # durex
        t = Image.new('RGBA', (170, 50), YEL + (170,)).rotate(a, expand=True)
        im.paste(t, (x - t.width // 2, y - t.height // 2), t)
    return im


BASE = base_img()
PAPEL = paper()
WFONT = F(150)


def orp(p):
    letras = re.sub(r'[^\wÀ-ú]', '', p); n = len(letras)
    k = 0 if n <= 1 else 1 if n <= 5 else 2 if n <= 9 else 3
    # índice real dentro da palavra (pula pontuação inicial)
    idx = [i for i, c in enumerate(p) if re.match(r'[\wÀ-ú]', c)]
    return idx[min(k, len(idx) - 1)] if idx else 0


def desenha_palavra(im, p, cor=INK):
    d = ImageDraw.Draw(im); k = orp(p)
    pre, mid, pos = p[:k], p[k], p[k + 1:]
    wpre = d.textlength(pre, font=WFONT); wmid = d.textlength(mid, font=WFONT)
    x = CXW - wpre - wmid / 2
    tot = d.textlength(p, font=WFONT)
    if x < BX0 + 40: x = BX0 + 40                       # palavra comprida não sai da tela
    if x + tot > BX1 - 40: x = BX1 - 40 - tot
    y = CYW - 92
    d.text((x, y), pre, font=WFONT, fill=cor)
    d.text((x + wpre, y), mid, font=WFONT, fill=RED)
    d.text((x + wpre + wmid, y), pos, font=WFONT, fill=cor)


def txt(s, size, fill, stroke=True):
    f = F(size); l, t, r, b = f.getbbox(s)
    im = Image.new('RGBA', (r - l + 30, b - t + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((15 - l, 15 - t), s, font=f, fill=fill,
                            stroke_width=6 if stroke else 0, stroke_fill=PAPER)
    return im


_cache = {}
def T(s, size, fill):
    k = (s, size, fill)
    if k not in _cache: _cache[k] = txt(s, size, fill)
    return _cache[k]


def poe(im, img, y, t=None, a=None, x=None):
    """cola centralizado; se a (início) for dado, escreve da esquerda pra direita em 0.35 s"""
    if a is not None and t is not None:
        p = min(1, (t - a) / 0.35); w = max(1, int(img.width * p)); img = img.crop((0, 0, w, img.height))
        x = (W - _full_w(img)) // 2 if x is None else x
    im.paste(img, ((W - img.width) // 2 if x is None else x, y), img)


def _full_w(img):
    return img.width


def poe_escrito(im, s, size, fill, y, t, a):
    img = T(s, size, fill); x = (W - img.width) // 2
    p = min(1, max(0, (t - a) / 0.35)); w = max(1, int(img.width * p))
    c = img.crop((0, 0, w, img.height)); im.paste(c, (x, y), c)


# velocímetro
GX, GY, GR = 540, 1600, 300
VMAX = 1000


def ang(v):  # 0 -> 180°, VMAX -> 0° (esquerda pra direita)
    return math.pi * (1 - min(v, VMAX) / VMAX)


def gauge_face():
    box = (GX - GR - 60, GY - GR - 60, GX + GR + 60, GY + 70)
    def d_(d, P):
        c = P(GX, GY)
        r = GR * 2
        d.pieslice([c[0] - r, c[1] - r, c[0] + r, c[1] + r], 180, 360, fill=(255, 255, 255, 255), outline=INK, width=10)
        # faixas: verde até 300, amarelo até 600, vermelho depois
        for v0, v1, cor in [(0, 300, (120, 200, 130)), (300, 600, (245, 205, 70)), (600, 1000, (230, 110, 100))]:
            a0 = 180 + 180 * v0 / VMAX; a1 = 180 + 180 * v1 / VMAX; rr = r - 30
            d.arc([c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr], a0, a1, fill=cor, width=40)
        for v in range(0, 1001, 100):
            a = ang(v); r1 = r - 70; r2 = r - (110 if v % 500 == 0 else 95)
            d.line([(c[0] + r1 * math.cos(a), c[1] - r1 * math.sin(a)), (c[0] + r2 * math.cos(a), c[1] - r2 * math.sin(a))],
                   fill=INK, width=8 if v % 500 == 0 else 5)
        d.line([(c[0] - r, c[1]), (c[0] + r, c[1])], fill=INK, width=10)
    lay = arte_2x(d_, box)
    d = ImageDraw.Draw(lay)
    for v in (0, 500, 1000):
        a = ang(v); rr = GR - 150
        s = str(v); f = F(48); w = d.textlength(s, font=f)
        d.text((GX + rr * math.cos(a) - w / 2 - box[0], GY - rr * math.sin(a) - 30 - box[1]), s, font=f, fill=INK)
    # marca "gente normal" ~240
    a = ang(240)
    return lay, box


GFACE, GBOX = gauge_face()


def gauge(im, v, rotulo):
    im.paste(GFACE, GBOX[:2], GFACE)
    def ponteiro(d, P):
        a = ang(v); c = P(GX, GY); r = (GR - 60) * 2
        tip = (c[0] + r * math.cos(a), c[1] - r * math.sin(a))
        perp = (math.sin(a) * 22, math.cos(a) * 22)
        d.polygon([(c[0] + perp[0], c[1] + perp[1]), tip, (c[0] - perp[0], c[1] - perp[1])], fill=RED)
        d.ellipse([c[0] - 36, c[1] - 36, c[0] + 36, c[1] + 36], fill=INK)
    lay = arte_2x(ponteiro, (GX - GR, GY - GR, GX + GR, GY + 40))
    im.paste(lay, (GX - GR, GY - GR), lay)
    img = T(rotulo, 80, INK); im.paste(img, ((W - img.width) // 2, GY + 30), img)


def olho(d, P, x, y, s=1.0):
    """olhinho de desenho (2x)"""
    c = P(x, y); w = 70 * s * 2; h = 40 * s * 2
    pts = [(c[0] + w * math.cos(t), c[1] + h * math.sin(t) * (1 if math.sin(t) > 0 else 1)) for t in np.linspace(0, 2 * math.pi, 60)]
    d.polygon(pts, fill=(255, 255, 255, 255), outline=INK, width=8)
    d.ellipse([c[0] - h * .8, c[1] - h * .8, c[0] + h * .8, c[1] + h * .8], fill=BLUE)
    d.ellipse([c[0] - h * .38, c[1] - h * .38, c[0] + h * .38, c[1] + h * .38], fill=INK)
    d.ellipse([c[0] - h * .5 + 10, c[1] - h * .5, c[0] - h * .5 + 26, c[1] - h * .5 + 16], fill=(255, 255, 255))


FRASE_NORMAL = ['Lendo', 'normal,', 'o', 'olho', 'pula', 'de', 'palavra', 'em', 'palavra.']


def cena_pulos(im, t, a, b):
    """fala 2: frase escrita normal e o olho pulando em arco de palavra em palavra"""
    d = ImageDraw.Draw(im); f = F(84)
    # 2 linhas dentro da tela
    linhas = [FRASE_NORMAL[:5], FRASE_NORMAL[5:]]; pos = []
    for li, ws in enumerate(linhas):
        tot = sum(d.textlength(w + ' ', font=f) for w in ws); x = (W - tot) / 2; y = 830 + li * 110
        for w in ws:
            wl = d.textlength(w, font=f); d.text((x, y), w, font=f, fill=INK)
            pos.append((x + wl / 2, y)); x += d.textlength(w + ' ', font=f)
    passo = (b - a) / (len(pos) + 0.5); k = (t - a) / passo
    i = min(int(k), len(pos) - 1); fr = min(1, (k - i) / 0.45)
    p0 = pos[max(i - 1, 0)] if i > 0 else (pos[0][0] - 150, pos[0][1])
    p1 = pos[i]
    e = fr * fr * (3 - 2 * fr)
    x = p0[0] + (p1[0] - p0[0]) * e
    yb = p0[1] + (p1[1] - p0[1]) * e - math.sin(math.pi * e) * (70 if p1[1] == p0[1] else 30)
    # arcos já percorridos (tracejado)
    def arcos(dd, P):
        for j in range(1, i + 1):
            q0, q1 = pos[j - 1], pos[j]
            if j == i and fr < 1: break
            for s in np.linspace(0, 1, 14)[::2]:
                xx = q0[0] + (q1[0] - q0[0]) * s; yy = q0[1] + (q1[1] - q0[1]) * s - math.sin(math.pi * s) * (70 if q1[1] == q0[1] else 30) - 50
                dd.ellipse([*P(xx - 5, yy - 5), *P(xx + 5, yy + 5)], fill=RED)
        olho(dd, P, x, yb - 60, 0.75)
    lay = arte_2x(arcos, (0, 700, W, 1100)); im.paste(lay, (0, 700), lay)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)


def frame(t, EV, DUR, l1_palavras):
    im = BASE.copy()
    ativo = None
    for e in EV:
        if e[2] <= t < e[3] + (0.0 if e[0] == 'teste' else 0.12): ativo = e
    # qual "bloco" estamos (pra saber o nível/velocímetro)
    nivel_feito = -1; prox = 0
    for e in EV:
        if e[0] == 'teste' and t >= e[2]: nivel_feito = e[1]
    fala = lambda i: next(e for e in EV if e[0] == 'fala' and e[1] == i)
    teste = lambda n: next(e for e in EV if e[0] == 'teste' and e[1] == n)
    f2 = fala(1); f3 = fala(2); f7 = fala(6)
    anun = lambda k: teste(k)[2] - (0.25 if k == 0 else 0.9)

    # ---- cabeçalho ----
    if t < f2[2]:
        poe_escrito(im, 'Até que velocidade', 118, INK, 150, t, -1)
        poe_escrito(im, 'tu consegue ler?', 118, RED, 300, t, -1)
    elif t < f3[2]:
        poe_escrito(im, 'Lendo normal...', 118, INK, 150, t, f2[2])
        poe_escrito(im, 'o olho fica pulando', 100, BLUE, 300, t, f2[2] + 0.5)
    elif t < teste(0)[2] - 0.25:
        poe_escrito(im, 'Aqui a palavra vem', 110, INK, 150, t, f3[2])
        poe_escrito(im, 'sempre no mesmo lugar', 100, BLUE, 290, t, f3[2] + 0.4)
    elif t < f7[2]:
        n = max([k for k in range(4) if t >= anun(k)] or [0])
        cor = [GREEN, (200, 140, 0), (220, 100, 40), RED][n]
        poe_escrito(im, f'NÍVEL {n + 1}' if n < 3 else 'NÍVEL FINAL', 150, cor, 140, t, -1)
        for k in range(4):                            # bolinhas de progresso
            x = 540 + (k - 1.5) * 70; ddd = ImageDraw.Draw(im)
            ddd.ellipse([x - 18, 345, x + 18, 381], fill=cor if k <= n else (255, 255, 255), outline=INK, width=4)
    else:
        poe_escrito(im, 'Conseguiu ler', 130, INK, 150, t, f7[2])
        poe_escrito(im, 'a última?', 130, RED, 300, t, f7[2] + 0.3)

    # ---- tela de leitura ----
    if f2[2] <= t < f3[2]:
        # cobre a tela com papel e mostra o olho pulando
        pp = PAPEL.crop((BX0 - 20, BY0 - 60, BX1 + 40, BY1 + 40))
        im.paste(pp, (BX0 - 20, BY0 - 60)); cena_pulos(im, t, f2[2], f2[3])
    elif t < f2[2]:
        for (p, a, b) in l1_palavras:
            if a <= t < b: desenha_palavra(im, p)
    elif f3[2] <= t < teste(0)[2]:
        desenha_palavra(im, 'palavra')
        if t > f3[2] + 1.6:
            poe_escrito(im, 'mira aqui!', 90, RED, 1080, t, f3[2] + 1.6)
    elif ativo and ativo[0] == 'teste':
        n = ativo[1]; q = NIVEIS[n][1]; fr = int((t - ativo[2]) * FPS + 1e-6); acc = 0
        for p, k in seq_palavras(NIVEIS[n][2], q):
            if acc <= fr < acc + k: desenha_palavra(im, p); break
            acc += k
    elif t >= f7[2]:
        desenha_palavra(im, '?')

    # ---- velocímetro ----
    if t < teste(0)[2] - 0.25:
        if f3[2] <= t:   # aparece na fala 3
            pass
    if t >= f3[2] + 1.0:
        alvo = 0; prev = 0; t0 = 0; rot = ''
        for k in range(4):
            if t >= anun(k):
                alvo = NIVEIS[k][0]; prev = NIVEIS[k - 1][0] if k else 0; t0 = anun(k)
                rot = f'{alvo} palavras/min'
        v = prev + (alvo - prev) * min(1, (t - t0) / 0.3) if alvo else 0
        if t >= f7[2]: rot = 'Não deu? Volta!'
        gauge(im, v, rot or 'palavras por minuto')
        fala4 = fala(3)
        if fala4[2] + 1.0 <= t < fala4[3]:
            poe_escrito(im, 'mais rápido que muita gente!', 76, GREEN, 1130, t, fala4[2] + 1.0)
    else:
        img = T('uma palavra por vez', 96, BLUE); im.paste(img, ((W - img.width) // 2, 1250), img)
    if t >= f7[2] + 2.6:
        poe_escrito(im, 'e não pisca!', 110, RED, 1760, t, f7[2] + 2.6)

    pos = [(560, 1830), (130, 1830), (560, 40), (130, 40)][int(t // 6) % 4]
    if t >= f7[2] + 2.6: pos = (560, 40)
    im.paste(WM, pos, WM)
    return im


def main():
    sr, clips = carrega_falas()
    dur = [len(c) / sr / TEMPO for c in clips]
    EV, DUR = monta_linha(dur)
    # palavras da fala 1 sincronizadas (tempos do Whisper, relativos ao corte)
    w1 = [('Tu', 0.08), ('consegue', 0.40), ('ler', 0.80), ('uma', 1.00), ('palavra', 1.25),
          ('por', 1.62), ('vez...', 1.85), ('bem', 2.55), ('rápido?', 2.80)]
    f1 = EV[0]; l1 = []
    for i, (p, s) in enumerate(w1):
        a = 0 if i == 0 else f1[2] + s / TEMPO
        b = f1[2] + w1[i + 1][1] / TEMPO if i + 1 < len(w1) else EV[1][2]
        l1.append((p, a, b))
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, EV, DUR, l1).save(f'prev_{s}.png')
        for e in EV: print(e)
        print('DUR', DUR); return
    # áudio montado
    full = np.zeros(int(DUR * sr) + sr, np.float32)
    for e in EV:
        if e[0] != 'fala': continue
        c = clips[e[1]].astype(np.float32)
        # acelera com atempo via ffmpeg
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-af', f'atempo={TEMPO}', '-f', 's16le', '-'], input=clips[e[1]].tobytes(), capture_output=True).stdout
        c = np.frombuffer(r, np.int16).astype(np.float32); i0 = int(e[2] * sr)
        full[i0:i0 + len(c)] += c[:len(full) - i0]
    full = full[:int(DUR * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          sys.argv[0].replace('video.py', '') + 'leitura_rapida.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, EV, DUR, l1).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
