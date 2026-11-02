"""Esse desenho é colorido? Grade de linhas coloridas sobre imagem P&B. Gera foto_colorida.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, re, sys, wave
from PIL import Image, ImageDraw, ImageFont
import cena

W, H, FPS = 1080, 1920, 30
TEMPO = 1.08
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
PAPER = (251, 245, 223); YEL = (245, 197, 24)

FALAS = [(0.0, 2.95), (3.15, 7.58), (7.93, 11.62), (12.17, 14.70), (14.87, 19.15), (19.43, 20.50)]
GAPS = [0.2, 0.3, 0.9, 0.3, 0.4, 0.0]
CX0, CY0, CX1, CY1 = 70, 420, 1010, 1360
PX, PY = 90, 440

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
    gaps = GAPS
    for i, g in enumerate(gaps):
        ev.append((i, t, t + d[i])); t += d[i] + g
    return ev, t + 1.0




def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


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








def rotulo(im, s, xy, cor, t, a):
    k = min(1, max(0, (t - a) / 0.18))
    if k <= 0: return
    img = T(s, 96, cor); esc = 1.4 - 0.4 * k
    i2 = img.resize((int(img.width * esc), int(img.height * esc)), Image.LANCZOS)
    bg = Image.new('RGBA', (i2.width + 20, i2.height), (255, 255, 255, 230))
    im.paste(bg, (xy[0] - bg.width // 2, xy[1] - bg.height // 2), bg)
    im.paste(i2, (xy[0] - i2.width // 2, xy[1] - i2.height // 2), i2)









def arte_2x(desenha, box):
    x0, y0, x1, y1 = box
    lay = Image.new('RGBA', ((x1 - x0) * 2, (y1 - y0) * 2), (0, 0, 0, 0))
    desenha(ImageDraw.Draw(lay), lambda x, y: ((x - x0) * 2, (y - y0) * 2))
    return lay.resize((x1 - x0, y1 - y0), Image.LANCZOS)


def base_img():
    im = paper()
    def card(d, Pp):
        a = Pp(CX0, CY0); b = Pp(CX1, CY1)
        d.rounded_rectangle([a[0] + 12, a[1] + 16, b[0] + 12, b[1] + 16], 30, fill=(0, 0, 0, 40))
        d.rounded_rectangle([a, b], 30, fill=(255, 255, 255, 255), outline=INK, width=10)
    lay = arte_2x(card, (CX0 - 10, CY0 - 10, CX1 + 30, CY1 + 30))
    im.paste(lay, (CX0 - 10, CY0 - 10), lay)
    return im


def fita(im):
    for (x, y, a) in [(160, CY0 + 6, -22), (920, CY0 + 6, 22)]:
        t = Image.new('RGBA', (180, 52), YEL + (170,)).rotate(a, expand=True, resample=Image.BICUBIC)
        im.paste(t, (x - t.width // 2, y - t.height // 2), t)


BASE = base_img()
COR = cena.colorida()
GRADE = np.asarray(cena.grade(COR), np.float32)
CINZA = np.asarray(cena.cinza(COR), np.float32)
_g = np.asarray(cena.grade(COR)); _c = np.asarray(cena.cinza(COR))
SO_LINHAS = np.where((np.abs(_g.astype(int) - _c.astype(int)).sum(2) > 0)[..., None], _g, 255).astype(np.float32)

ROTULOS = [('vermelha', (490 + 90, 575 + 440), RED), ('amarela', (560 + 90, 380 + 440), (200, 150, 0)), ('azul', (450 + 90, 780 + 440), BLUE)]
WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)


def frame(t, EV, DUR):
    im = BASE.copy()
    st = [e[1] for e in EV]; en = [e[2] for e in EV]
    fala = max([i for i, s in enumerate(st) if t >= s] or [0])

    # ---- imagem ----
    tira = en[2] + 0.1
    if t < tira:
        a = GRADE
    elif fala < 4 or t < st[4] + 0.2:
        k = min(1, (t - tira) / 0.5); a = GRADE + (CINZA - GRADE) * k
    elif fala == 4:
        a = SO_LINHAS if t < st[4] + 2.2 else CINZA
    else:
        a = GRADE
    im.paste(Image.fromarray(a.astype(np.uint8)), (PX, PY)); fita(im)

    # ---- cabeçalho ----
    if fala == 0:
        pop(im, 'Esse desenho', 130, INK, 70, t, None)
        pop(im, 'é colorido?', 150, RED, 195, t, None)
    elif fala == 1:
        pop(im, 'Tudo coloridinho...', 120, INK, 120, t, st[1])
        for (s, xy, c), dt in zip(ROTULOS, (0.2, 1.7, 3.1)):
            rotulo(im, s, xy, c, t, st[1] + dt)
    elif fala == 2:
        pop(im, 'Vou tirar só', 130, INK, 70, t, st[2])
        pop(im, 'as linhas...', 140, RED, 200, t, st[2] + 1.6)
    elif fala == 3:
        pop(im, 'Era PRETO', 160, RED, 50, t, st[3] - 0.1)
        pop(im, 'E BRANCO!', 160, RED, 200, t, st[3] + 0.4)
        pop(im, 'o tempo todo!', 110, INK, CY1 + 60, t, st[3] + 1.0)
    elif fala == 4:
        if t < st[4] + 2.2:
            pop(im, 'Só as linhas', 130, INK, 70, t, st[4])
            pop(im, 'tinham cor!', 140, RED, 200, t, st[4] + 0.4)
        else:
            pop(im, 'O resto teu', 130, INK, 70, t, st[4] + 2.2)
            pop(im, 'cérebro pintou!', 140, RED, 200, t, st[4] + 2.5)
    else:
        pop(im, 'Volta e', 140, INK, 70, t, st[5])
        pop(im, 'confere!', 150, RED, 200, t, st[5] + 0.2)

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
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'foto_colorida.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, EV, DUR).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
