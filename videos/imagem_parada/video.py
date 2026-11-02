"""Essa imagem tá parada: ilusão de deriva periférica no caderno. Gera imagem_parada.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, re, sys, wave
from PIL import Image, ImageDraw, ImageFont
import ilusao

W, H, FPS = 1080, 1920, 30
TEMPO = 1.08
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
PAPER = (251, 245, 223); YEL = (245, 197, 24)

# (início, fim) de cada fala no falas/take1.wav
FALAS = [(0.0, 3.03), (3.30, 5.17), (5.62, 6.42), (6.66, 7.66), (8.15, 11.20),
         (11.48, 15.65), (15.88, 20.96), (21.38, 23.95)]


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


def monta_linha(d):
    ev = []; t = 0.05
    gaps = [0.05, 0.05, 0.25, 0.9, 1.0, 0.05, 0.6, 0.0]
    for i, g in enumerate(gaps):
        ev.append((i, t, t + d[i])); t += d[i] + g
    return ev, t + 1.0


# ---------- desenho ----------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


P = 900
PX, PY = (W - P) // 2, 430
CX0, CY0, CX1, CY1 = PX - 30, PY - 30, PX + P + 30, PY + P + 30
MX, MY = PX + P // 2, PY + P // 2          # centro (bolinha do meio)


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
    pn = ilusao.painel(P); im.paste(pn, (PX, PY), pn)
    for (x, y, a) in [(160, CY0 + 6, -22), (920, CY0 + 6, 22)]:
        t = Image.new('RGBA', (180, 52), YEL + (170,)).rotate(a, expand=True, resample=Image.BICUBIC)
        im.paste(t, (x - t.width // 2, y - t.height // 2), t)
    return im


BASE = base_img()


def ponto_vermelho():
    def d(dr, Pp):
        a = Pp(MX - 30, MY - 30); b = Pp(MX + 30, MY + 30)
        dr.ellipse([a, b], fill=(255, 255, 255, 255))
        a = Pp(MX - 20, MY - 20); b = Pp(MX + 20, MY + 20)
        dr.ellipse([a, b], fill=RED + (255,))
    return arte_2x(d, (MX - 40, MY - 40, MX + 40, MY + 40))


PONTO = ponto_vermelho()


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


def pop(im, s, size, fill, y, t, a, x=None):
    """carimbo: entra grande e assenta (0.18 s)"""
    img = T(s, size, fill)
    k = 1 if a is None else min(1, max(0, (t - a) / 0.18))
    if k <= 0: return
    esc = 1.4 - 0.4 * (k * k * (3 - 2 * k))
    i2 = img.resize((int(img.width * esc), int(img.height * esc)), Image.LANCZOS)
    cx = W // 2 if x is None else x
    im.paste(i2, (cx - i2.width // 2, y - (i2.height - img.height) // 2), i2)


def pausa_icone(im, t, a):
    k = min(1, max(0, (t - a) / 0.18))
    if k <= 0: return
    d = ImageDraw.Draw(im); cx, cy, s = 175, 205, int(70 * (1.4 - 0.4 * k))
    d.rounded_rectangle([cx - s, cy - s, cx + s, cy + s], 24, fill=(255, 255, 255), outline=INK, width=7)
    d.rounded_rectangle([cx - s * 0.45, cy - s * 0.55, cx - s * 0.12, cy + s * 0.55], 6, fill=RED)
    d.rounded_rectangle([cx + s * 0.12, cy - s * 0.55, cx + s * 0.45, cy + s * 0.55], 6, fill=RED)


def legenda_cores(im, t, a):
    """preto -> azul -> branco -> amarelo, com seta: o cérebro 'empurra' pra esse lado"""
    k = min(1, max(0, (t - a) / 0.3))
    if k <= 0: return
    d = ImageDraw.Draw(im); y = CY1 + 245; x0 = 220
    cores = [ilusao.PRETO, ilusao.AZUL, ilusao.BRANCO, ilusao.AMARELO]
    larg = [40, 150, 40, 150]
    x = x0
    n = max(1, int(round(k * 4)))
    for c, w in list(zip(cores, larg))[:n]:
        d.rectangle([x, y, x + w, y + 90], fill=c, outline=INK, width=4); x += w
    if k >= 1:
        d.line([(x + 30, y + 45), (x + 170, y + 45)], fill=RED, width=12)
        d.polygon([(x + 200, y + 45), (x + 160, y + 15), (x + 160, y + 75)], fill=RED)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)


def frame(t, EV, DUR):
    im = BASE.copy()
    st = [e[1] for e in EV]
    fala = max([i for i, s in enumerate(st) if t >= s] or [0])

    # ---- cabeçalho ----
    if fala <= 0:
        pop(im, 'Essa imagem tá', 112, INK, 70, t, None)
        pop(im, 'PARADA!', 150, RED, 185, t, None)
    elif fala == 1:
        pop(im, 'Tá girando,', 130, INK, 70, t, st[1])
        pop(im, 'né?', 130, RED, 200, t, st[1] + 0.5)
    elif fala in (2, 3):
        pausa_icone(im, t, st[2])
        pop(im, 'Pausa o vídeo...', 110, INK, 80, t, st[2], x=W // 2 + 80)
        pop(im, 'continua girando!', 112, RED, 205, t, st[3], x=W // 2 + 80)
    elif fala == 4:
        pop(im, 'Olha fixo na', 118, INK, 70, t, st[4])
        pop(im, 'bolinha vermelha', 118, RED, 195, t, st[4])
    elif fala == 5:
        pop(im, 'Teu olho dá ~3', 118, INK, 70, t, st[5])
        pop(im, 'pulinhos por segundo', 104, BLUE, 200, t, st[5] + 0.4)
    elif fala == 6:
        pop(im, 'Escuro e claro chegam', 100, INK, 80, t, st[6])
        pop(im, 'em tempos diferentes', 100, BLUE, 200, t, st[6] + 0.4)
    else:
        pop(im, 'Solta o olho...', 120, INK, 70, t, st[7])
        pop(im, 'voltou a girar!', 130, RED, 200, t, st[7] + 0.9)

    # ---- bolinha vermelha (só na fala 4) ----
    if fala == 4:
        im.paste(PONTO, (MX - 40, MY - 40), PONTO)
        if t >= st[4] + 2.0:
            pop(im, 'parou?', 120, RED, CY1 + 60, t, st[4] + 2.0)

    # ---- explicação abaixo do quadro ----
    if fala == 5:
        pop(im, 'sem tu perceber!', 110, RED, CY1 + 60, t, st[5] + 2.2)
    if fala == 6:
        pop(im, 'aí o cérebro inventa o movimento', 84, RED, CY1 + 80, t, st[6] + 2.8)
        legenda_cores(im, t, st[6] + 0.6)
    if fala == 0:
        pop(im, 'juro!', 110, BLUE, CY1 + 60, t, st[0] + 1.9)

    pos = [(560, 1840), (130, 1840), (560, 1720), (130, 1720)][int(t // 5) % 4]
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
    for i, a, b in EV:
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-af', f'atempo={TEMPO}', '-f', 's16le', '-'], input=clips[i].tobytes(), capture_output=True).stdout
        c = np.frombuffer(r, np.int16).astype(np.float32); i0 = int(a * sr)
        full[i0:i0 + len(c)] += c[:len(full) - i0]
    full = full[:int(DUR * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'imagem_parada.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, EV, DUR).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
