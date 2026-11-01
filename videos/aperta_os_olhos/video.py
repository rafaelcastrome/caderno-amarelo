"""Aperta os olhos: desenhos escondidos em rabiscos de caneta. Gera aperta_os_olhos.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, math, re, sys, wave
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import oculto

W, H, FPS = 1080, 1920, 30
TEMPO = 1.08
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
ORANGE = (220, 120, 30); PAPER = (251, 245, 223); YEL = (245, 197, 24)

# (início, fim) de cada fala no falas/take1.wav (cortes no meio dos silêncios)
FALAS = [(0.0, 2.75), (2.85, 5.35), (5.40, 7.42), (7.50, 9.90), (11.30, 13.55),
         (15.20, 19.25), (20.60, 23.60)]


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
        for s, e in sil:            # pausa interna longa vira 0.25 s
            if s > a + 0.05 and e < b - 0.05 and e - s > 0.3:
                partes.append(pcm[int(cur * sr):int((s + 0.12) * sr)]); cur = e - 0.12
        partes.append(pcm[int(cur * sr):int(b * sr)])
        clips.append(np.concatenate(partes))
    return sr, clips


# ---------- linha do tempo ----------
def monta_linha(d):
    ev = []; t = 0.1
    def fala(i, gap=0.1):
        nonlocal t
        ev.append(('fala', i, t, t + d[i])); t += d[i] + gap
    def marca(nome, dur=0.0):
        nonlocal t
        ev.append((nome, None, t, t + dur)); t += dur
    marca('fase1')
    fala(0); fala(1, 0.0); marca('tenta1', 2.3)
    marca('rev1'); fala(2, 0.0); t += 0.5
    marca('fase2'); fala(3, 0.0); marca('tenta2', 2.5)
    marca('rev2'); fala(4, 0.0); t += 0.4
    marca('fase3'); fala(5, 0.0); marca('tenta3', 3.0)
    marca('fim'); fala(6, 0.0)
    return ev, t + 0.7


# ---------- desenho ----------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


P = 920                                  # lado do quadro de rabiscos
PX, PY = (W - P) // 2, 470               # canto do quadro
CX0, CY0, CX1, CY1 = PX - 28, PY - 28, PX + P + 28, PY + P + 28


def arte_2x(desenha, box):
    x0, y0, x1, y1 = box
    lay = Image.new('RGBA', ((x1 - x0) * 2, (y1 - y0) * 2), (0, 0, 0, 0))
    desenha(ImageDraw.Draw(lay), lambda x, y: ((x - x0) * 2, (y - y0) * 2))
    return lay.resize((x1 - x0, y1 - y0), Image.LANCZOS)


def base_img():
    im = paper()
    def card(d, Pp):
        a = Pp(CX0, CY0); b = Pp(CX1, CY1)
        d.rounded_rectangle([a[0] + 12, a[1] + 16, b[0] + 12, b[1] + 16], 50, fill=(0, 0, 0, 40))
        d.rounded_rectangle([a, b], 50, fill=(255, 255, 255, 255), outline=INK, width=10)
    lay = arte_2x(card, (CX0 - 10, CY0 - 10, CX1 + 30, CY1 + 30))
    im.paste(lay, (CX0 - 10, CY0 - 10), lay)
    return im


def fita(im):
    for (x, y, a) in [(150, CY0 + 6, -22), (930, CY0 + 6, 22)]:
        t = Image.new('RGBA', (180, 52), YEL + (170,)).rotate(a, expand=True, resample=Image.BICUBIC)
        im.paste(t, (x - t.width // 2, y - t.height // 2), t)


BASE = base_img()

# quadros escondidos: (desenho, faixa de tinta, semente) -> fácil, médio, difícil
NIVEIS = [(oculto.gato(), (0.30, 0.70), 7), (oculto.caveira(), (0.37, 0.63), 7),
          (oculto.palavra('UVA'), (0.39, 0.61), 11)]
QUADROS = []
for alvo, faixa, seed in NIVEIS:
    nit = oculto.render(oculto.esconde(alvo, seed, faixa)).resize((P, P), Image.LANCZOS)
    # revelação = "apertar os olhos": borra e estica o contraste pro desenho saltar
    b = np.asarray(nit.filter(ImageFilter.GaussianBlur(16)), np.float32)
    lum = b.mean(2); lo, hi = np.percentile(lum, 2), np.percentile(lum, 98)
    k = np.clip((lum - lo) / (hi - lo), 0, 1)[..., None]
    ink = np.array((28, 40, 110), np.float32); white = np.array((255, 255, 255), np.float32)
    bor = Image.fromarray((ink + (white - ink) * k).astype(np.uint8))
    QUADROS.append((nit, bor))


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


def escrito(im, s, size, fill, y, t, a, x=None):
    """escreve da esquerda pra direita em 0.35 s a partir de a"""
    img = T(s, size, fill); x = (W - img.width) // 2 if x is None else x
    p = min(1, max(0, (t - a) / 0.35)) if a is not None else 1
    w = max(1, int(img.width * p)); c = img.crop((0, 0, w, img.height)); im.paste(c, (x, y), c)


def pop(im, s, size, fill, y, t, a):
    """carimbo: entra grande e assenta"""
    img = T(s, size, fill); k = min(1, max(0, (t - a) / 0.22))
    esc = 1.5 - 0.5 * (k * k * (3 - 2 * k))
    if k <= 0: return
    i2 = img.resize((int(img.width * esc), int(img.height * esc)), Image.LANCZOS)
    im.paste(i2, ((W - i2.width) // 2, y - (i2.height - img.height) // 2), i2)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)
ROT = [('FASE 1 de 3 · fácil', GREEN), ('FASE 2 de 3 · médio', ORANGE), ('FASE 3 de 3 · difícil', RED)]
RESP = ['UM GATO!', 'UMA CAVEIRA!']


def frame(t, EV, DUR):
    im = BASE.copy()
    ev = {e[0] if e[0] != 'fala' else f'f{e[1]}': e for e in EV}
    fase = 2 if t >= ev['fase3'][2] else 1 if t >= ev['fase2'][2] else 0
    nit, bor = QUADROS[fase]

    # ---- quadro (nítido; na revelação "aperta os olhos" = borra) ----
    rev = ev.get(f'rev{fase + 1}')
    q = nit
    if rev and t >= rev[2]:
        k = min(1, (t - rev[2]) / 0.6); k = k * k * (3 - 2 * k)
        q = Image.blend(nit, bor, k)
    im.paste(q, (PX, PY)); fita(im)

    # ---- cabeçalho ----
    if fase == 0 and t < ev['f1'][2]:
        escrito(im, 'Tem um desenho', 118, INK, 95, t, None)
        escrito(im, 'escondido aqui!', 118, RED, 225, t, None)
    elif fase == 0 and t < ev['rev1'][2]:
        escrito(im, 'Aperta os olhos', 118, RED, 95, t, ev['f1'][2])
        escrito(im, 'ou afasta o celular', 96, BLUE, 235, t, ev['f1'][2] + 0.6)
    elif fase == 2 and t < ev['fim'][2]:
        escrito(im, 'Agora é uma', 118, INK, 95, t, ev['f5'][2])
        escrito(im, 'PALAVRA', 128, RED, 220, t, ev['f5'][2] + 0.4)
    elif fase == 2:
        escrito(im, 'Conseguiu ler?', 130, INK, 95, t, ev['fim'][2])
        escrito(im, 'Comenta a palavra!', 104, RED, 230, t, ev['fim'][2] + 0.4)
    else:
        escrito(im, 'Aperta os olhos', 118, INK, 95, t, None)
        escrito(im, 'ou afasta o celular', 96, BLUE, 235, t, None)

    # rótulo da fase
    r, cor = ROT[fase]
    img = T(r, 70, cor); im.paste(img, ((W - img.width) // 2, 360), img)

    # ---- abaixo do quadro ----
    tenta = ev[f'tenta{fase + 1}']
    if rev and t >= rev[2]:
        pop(im, RESP[fase], 140, RED, CY1 + 40, t, rev[2] + 0.35)
    elif tenta[2] <= t < tenta[3] or (fase == 2 and t >= tenta[2]):
        # barrinha de tempo diminuindo
        k = 1 - min(1, (t - tenta[2]) / (tenta[3] - tenta[2]))
        d = ImageDraw.Draw(im); x0, x1, y = 190, 890, CY1 + 75
        d.rounded_rectangle([x0, y, x1, y + 44], 22, fill=(255, 255, 255), outline=INK, width=5)
        if k > 0.02:
            d.rounded_rectangle([x0 + 8, y + 8, x0 + 8 + (x1 - x0 - 16) * k, y + 36], 14, fill=cor)
        if fase == 2 and t >= ev['fim'][2]:
            img = T('não vou contar...', 92, BLUE); im.paste(img, ((W - img.width) // 2, CY1 + 150), img)
    elif fase == 0 and t < ev['f1'][2]:
        img = T('consegue ver?', 110, BLUE); im.paste(img, ((W - img.width) // 2, CY1 + 45), img)

    pos = [(560, 1840), (130, 1840), (560, 1700), (130, 1700)][int(t // 5) % 4]
    im.paste(WM, pos, WM)
    return im


def main():
    sr, clips = carrega_falas()
    dur = [len(c) / sr / TEMPO for c in clips]
    EV, DUR = monta_linha(dur)
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, EV, DUR).save(f'prev_{s}.png')
        for e in EV: print(e)
        print('DUR', DUR); return
    full = np.zeros(int(DUR * sr) + sr, np.float32)
    for e in EV:
        if e[0] != 'fala': continue
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-af', f'atempo={TEMPO}', '-f', 's16le', '-'], input=clips[e[1]].tobytes(), capture_output=True).stdout
        c = np.frombuffer(r, np.int16).astype(np.float32); i0 = int(e[2] * sr)
        full[i0:i0 + len(c)] += c[:len(full) - i0]
    full = full[:int(DUR * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'aperta_os_olhos.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, EV, DUR).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
