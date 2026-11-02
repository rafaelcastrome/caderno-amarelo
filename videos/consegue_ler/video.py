"""Tu consegue ler isso? Letras trocadas e números no lugar de letras. Gera consegue_ler.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, re, sys, wave
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
TEMPO = 1.08
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
PAPER = (251, 245, 223); YEL = (245, 197, 24)

# (início, fim) de cada fala no falas/take1.wav
FALAS = [(0.30, 2.95), (3.18, 5.95), (6.36, 7.25), (8.12, 11.44), (12.09, 18.15),
         (18.54, 21.90), (22.42, 24.01)]
GAPS = [2.3, 0.3, 2.3, 0.35, 0.3, 0.35, 0.0]

# frase 1: (escrito, certo) por palavra
F1 = [[('Se', 'Se'), ('tu', 'tu'), ('cosneguiu', 'conseguiu')],
      [('ler', 'ler'), ('isso,', 'isso,'), ('o', 'o'), ('teu', 'teu')],
      [('cérbero', 'cérebro'), ('é', 'é'), ('bem', 'bem'), ('mias', 'mais')],
      [('rpáido', 'rápido'), ('do', 'do'), ('que', 'que')],
      [('tu', 'tu'), ('ahca!', 'acha!')]]
F2 = [[('4G0R4', 'AGORA'), ('TU', 'TU'), ('T4', 'TA')],
      [('L3ND0', 'LENDO'), ('1SS0', 'ISSO')],
      [('S3M', 'SEM')],
      [('P3RC3B3R!', 'PERCEBER!')]]
F3 = [[('Já', 'Já'), ('revisei', 'revisei')], [('o', 'o'), ('texto,', 'texto,')],
      [('tá', 'tá'), ('tudo', 'tudo')], [('ceto!', '')]]

CX0, CY0, CX1, CY1 = 60, 400, 1020, 1300


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
    for (x, y, a) in [(160, CY0 + 6, -22), (920, CY0 + 6, 22)]:
        t = Image.new('RGBA', (180, 52), YEL + (170,)).rotate(a, expand=True, resample=Image.BICUBIC)
        im.paste(t, (x - t.width // 2, y - t.height // 2), t)
    return im


BASE = base_img()


def frase(im, linhas, size, rev, cor_rev=RED):
    """escreve no cartão; rev=True pinta de vermelho as letras fora do lugar"""
    d = ImageDraw.Draw(im); f = F(size); esp = f.getlength(' ')
    alt = size * 1.12; y = (CY0 + CY1) / 2 - alt * len(linhas) / 2 - size * 0.12
    for ln in linhas:
        total = sum(f.getlength(w) for w, _ in ln) + esp * (len(ln) - 1)
        x = W / 2 - total / 2
        for w, c in ln:
            for i, ch in enumerate(w):
                errado = rev and (i >= len(c) or ch != c[i])
                d.text((x, y), ch, font=f, fill=cor_rev if errado else INK)
                if errado:
                    d.line([(x, y + size * 1.02), (x + f.getlength(ch), y + size * 1.02)], fill=cor_rev, width=6)
                x += f.getlength(ch)
            x += esp
        y += alt


def palavra_explica(im, t, a):
    """C é r b e r O: primeira e última circuladas"""
    d = ImageDraw.Draw(im); f = F(190); w = 'cérbero'
    xs = []; x = W / 2 - f.getlength(w) / 2; y = 640
    for ch in w:
        xs.append((x, f.getlength(ch))); x += f.getlength(ch)
    for i, ch in enumerate(w):
        meio = 0 < i < len(w) - 1
        jit = 6 * np.sin(t * 13 + i * 2) if meio else 0
        d.text((xs[i][0], y + jit), ch, font=f, fill=(150, 150, 150) if meio else INK)
    k = min(1, max(0, (t - a) / 0.3))
    if k > 0:
        for i in (0, len(w) - 1):
            cx = xs[i][0] + xs[i][1] / 2; cy = y + 112
            r = 72 * (1.3 - 0.3 * k)
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GREEN, width=10)
    if t >= a + 0.8:
        img = T('o meio, ele adivinha!', 92, BLUE); im.paste(img, ((W - img.width) // 2, 1020), img)


def barra(im, t, a, b, cor):
    k = 1 - min(1, max(0, (t - a) / (b - a)))
    d = ImageDraw.Draw(im); x0, x1, y = 190, 890, CY1 + 80
    d.rounded_rectangle([x0, y, x1, y + 44], 22, fill=(255, 255, 255), outline=INK, width=5)
    if k > 0.02:
        d.rounded_rectangle([x0 + 8, y + 8, x0 + 8 + (x1 - x0 - 16) * k, y + 36], 14, fill=cor)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)


def frame(t, EV, DUR):
    im = BASE.copy()
    st = [e[1] for e in EV]; en = [e[2] for e in EV]
    fala = max([i for i, s in enumerate(st) if t >= s] or [0])

    # ---- cartão ----
    if fala <= 1:
        frase(im, F1, 112, fala == 1 and t >= st[1] + 1.4)
    elif fala <= 3:
        frase(im, F2, 150, fala == 3 and t >= st[3] + 0.2)
    elif fala == 4:
        if t < st[4] + 1.0:
            frase(im, F1, 112, True)
        else:
            palavra_explica(im, t, st[4] + 3.0)
    elif fala == 5:
        frase(im, F3, 140, t >= st[5] + 1.6)
    else:
        frase(im, F1, 112, False)

    # ---- cabeçalho ----
    if fala == 0:
        pop(im, 'Tu consegue', 130, INK, 70, t, None)
        pop(im, 'ler isso?', 150, RED, 195, t, None)
        if t >= en[0]:
            img = T('lê rapidinho!', 110, BLUE); im.paste(img, ((W - img.width) // 2, CY1 + 150), img)
            barra(im, t, en[0], st[1], GREEN)
    elif fala == 1:
        pop(im, 'Leu, né?', 140, INK, 70, t, st[1])
        pop(im, 'Tava tudo trocado!', 118, RED, 205, t, st[1] + 1.4)
    elif fala == 2:
        pop(im, 'Agora essa...', 140, INK, 120, t, st[2])
        if t >= en[2]:
            barra(im, t, en[2], st[3], RED)
    elif fala == 3:
        pop(im, 'Leu número', 130, INK, 70, t, st[3])
        pop(im, 'como se fosse letra!', 112, RED, 205, t, st[3] + 0.3)
    elif fala == 4:
        pop(im, 'Tu não lê', 130, INK, 70, t, st[4] + 1.0)
        pop(im, 'letra por letra!', 130, RED, 200, t, st[4] + 1.5)
    elif fala == 5:
        pop(im, 'Por isso tu não acha', 104, INK, 80, t, st[5])
        pop(im, 'teu próprio erro!', 118, RED, 200, t, st[5] + 0.6)
    else:
        pop(im, 'Comenta aí se tu', 112, INK, 75, t, st[6])
        pop(im, 'leu de primeira!', 130, RED, 200, t, st[6] + 0.3)

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
                          'consegue_ler.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, EV, DUR).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
