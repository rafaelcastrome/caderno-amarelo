"""Não pisca: efeito cascata (motion aftereffect). Listras de caneta andam em direção ao olho
(de cima pra baixo e de baixo pra cima); depois de ~22 s olhando, tudo parado parece crescer/esticar.
Gera nao_pisca.mp4.  Uso: python3 video.py [segundos...] -> prévias prev_*.png
"""
import numpy as np, subprocess, math, sys, wave
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); PAPER = (251, 245, 223)
EYE_Y = 960; PER = 44; VEL = 150          # período das listras (px) e velocidade (px/s)

# (início, fim, pausa depois) no take1.wav
CLIPS = [(0.27, 5.38, 0.8),    # 0 Não pisca! Olha fixo pro olho...
         (5.70, 9.80, 1.2),    # 1 Teu cérebro tá se acostumando...
         (10.09, 12.40, 1.2),  # 2 Continua olhando... não pisca
         (12.66, 17.34, 0.5),  # 3 Quando eu falar agora... olha pra tua mão
         (17.66, 21.69, 1.8),  # 4 Três, dois, um... Agora!
         (21.99, 24.95, 0.2),  # 5 Tá crescendo, né? Parece que tudo tá esticando
         (25.40, 28.46, 0.2),  # 6 É teu cérebro corrigindo...
         (28.94, 31.63, 0.5)]  # 7 Comenta se esticou... e volta


def carrega():
    with wave.open('take1.wav') as w:
        sr = w.getframerate(); pcm = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    out = []
    for a, b, g in CLIPS:
        c = pcm[int(a * sr):int(b * sr)].astype(np.float32)
        n = int(0.008 * sr); c[:n] *= np.linspace(0, 1, n); c[-n:] *= np.linspace(1, 0, n); out.append(c)
    ev = []; t = 0.1
    for (a, b, g), c in zip(CLIPS, out):
        d = len(c) / sr; ev.append((t, t + d)); t += d + g
    return sr, out, ev, t


def arte(desenha, w, h):
    lay = Image.new('RGBA', (w * 2, h * 2), (0, 0, 0, 0)); desenha(ImageDraw.Draw(lay), 2)
    return lay.resize((w, h), Image.LANCZOS)


def olho_img():
    s = 2; w, h = 340 * s, 200 * s; cx, cy = w / 2, h / 2
    top = [(cx + (w / 2 - 14 * s) * math.cos(u), cy - 78 * s * math.sin(u)) for u in np.linspace(0, math.pi, 60)]
    bot = [(cx + (w / 2 - 14 * s) * math.cos(u), cy - 70 * s * math.sin(u)) for u in np.linspace(math.pi, 2 * math.pi, 60)]
    base = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(base)
    d.polygon(top + bot, fill=(255, 255, 255, 255))
    iris = Image.new('RGBA', (w, h), (0, 0, 0, 0)); di = ImageDraw.Draw(iris); R = 66 * s
    for k in range(30):
        r = R * (1 - k / 30); g = k / 30
        di.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(int(30 + 60 * g), int(80 + 90 * g), int(140 + 80 * g), 255))
    for k in range(24):
        an = k * math.tau / 24
        di.line([(cx + 30 * s * math.cos(an), cy + 30 * s * math.sin(an)), (cx + 60 * s * math.cos(an), cy + 60 * s * math.sin(an))],
                fill=(20, 60, 110, 255), width=2 * s)
    di.ellipse([cx - 28 * s, cy - 28 * s, cx + 28 * s, cy + 28 * s], fill=(15, 15, 15, 255))
    di.ellipse([cx + 8 * s, cy - 30 * s, cx + 30 * s, cy - 8 * s], fill=(255, 255, 255, 255))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).polygon(top + bot, fill=255)
    iris.putalpha(Image.fromarray(np.minimum(np.asarray(iris.getchannel('A')), np.asarray(m))))
    base.alpha_composite(iris); d = ImageDraw.Draw(base)
    d.line(top + bot + [top[0]], fill=(25, 25, 25, 255), width=9 * s, joint='curve')
    for k in range(6):
        u = math.pi * (0.2 + 0.12 * k); x, y = cx + (w / 2 - 14 * s) * math.cos(u), cy - 78 * s * math.sin(u)
        d.line([(x, y), (x + 22 * s * math.cos(u), y - 30 * s * math.sin(u))], fill=(25, 25, 25, 255), width=7 * s)
    return base.resize((w // 2, h // 2), Image.LANCZOS)


OLHO = olho_img()


def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54): d.line([(x, 0), (x, H)], fill=(200, 210, 212), width=2)
    for y in range(30, H, 54): d.line([(0, y), (W, y)], fill=(200, 210, 212), width=2)
    d.rectangle([88, 0, 91, H], fill=(236, 170, 150)); return im


PAPEL = paper()
# listras: tira com período PER, metade tinta metade papel, bordas suaves
yy = np.arange(H + PER)
fase = (yy % PER) / PER
alpha = np.clip((np.abs(fase - 0.5) - 0.25) * 12 + 0.5, 0, 1)   # 1 = papel, 0 = tinta
ink = np.array(INK, np.float32); pap = np.array(PAPER, np.float32)
TIRA = (ink + (pap - ink) * alpha[:, None]).astype(np.uint8)


def listras(t):
    off = int(t * VEL) % PER
    a = np.empty((H, W, 3), np.uint8)
    top = TIRA[PER - off: PER - off + EYE_Y]          # metade de cima desce
    bot = TIRA[off: off + H - EYE_Y]                 # metade de baixo sobe
    a[:EYE_Y] = top[:, None, :]; a[EYE_Y:] = bot[:, None, :]
    return Image.fromarray(a)


def txt(s, size, fill, stroke=6):
    f = F(size); l, t, r, b = f.getbbox(s)
    im = Image.new('RGBA', (r - l + 30, b - t + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((15 - l, 15 - t), s, font=f, fill=fill, stroke_width=stroke, stroke_fill=PAPER)
    return im


_c = {}
def T(s, size, fill):
    k = (s, size, fill)
    if k not in _c: _c[k] = txt(s, size, fill)
    return _c[k]


def caixa(im, linhas, y):
    """texto num papelzinho (pra não brigar com as listras)"""
    imgs = [T(*l) for l in linhas]; w = max(i.width for i in imgs) + 60; h = sum(i.height for i in imgs) + 30
    d = ImageDraw.Draw(im); x0 = (W - w) // 2
    d.rounded_rectangle([x0, y, x0 + w, y + h], 36, fill=PAPER, outline=INK, width=6)
    yy = y + 15
    for i in imgs: im.paste(i, ((W - i.width) // 2, yy), i); yy += i.height


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=0)


def frame(t, ev, dur):
    agora = ev[4][1] - 0.45                     # "Agora!" (fim da contagem)
    cur = max([i for i, (a, b) in enumerate(ev) if t >= a - 0.05] or [0])
    loop = t >= dur - 0.35                     # últimos quadros voltam pras listras (loop)
    if t < agora or loop:
        im = listras(t)
        im.paste(OLHO, ((W - OLHO.width) // 2, EYE_Y - OLHO.height // 2), OLHO)
        if cur <= 1 or loop: caixa(im, [('NÃO PISCA!', 150, RED), ('olha só pro olho', 90, INK)], 110)
        elif cur == 2: caixa(im, [('continua olhando...', 100, INK)], 140)
        else: caixa(im, [('quando eu falar AGORA', 90, INK), ('olha pra tua mão!', 110, RED)], 110)
        if cur == 4:
            a = ev[4][0]; n = 3 - int((t - a) / ((agora - a) / 3)); n = max(1, min(3, n))
            caixa(im, [(str(n), 200, RED)], 1450)
    else:
        im = PAPEL.copy()
        im.paste(OLHO, ((W - OLHO.width) // 2, EYE_Y - OLHO.height // 2), OLHO)
        if t < ev[5][0]:
            caixa(im, [('AGORA!', 200, RED), ('olha pra tua mão', 100, INK)], 140)
        elif cur <= 6:
            caixa(im, [('tá crescendo, né?!', 110, RED)], 160)
            caixa(im, [('teu cérebro ainda', 80, INK), ('tá corrigindo o movimento', 80, INK)], 1350)
        else:
            caixa(im, [('ESTICOU?', 160, RED), ('comenta aí!', 100, INK)], 140)
            caixa(im, [('volta e testa de novo', 90, BLUE)], 1400)
    pos = [(560, 1840), (130, 1840), (560, 1730), (130, 1730)][int(t // 5) % 4]
    im.paste(WM, pos, WM)
    return im


def main():
    sr, clips, ev, dur = carrega()
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, ev, dur).save(f'prev_{s}.png')
        print([(round(a, 2), round(b, 2)) for a, b in ev], 'DUR', round(dur, 2)); return
    full = np.zeros(int(dur * sr) + sr, np.float32)
    for (a, b), c in zip(ev, clips):
        i0 = int(a * sr); full[i0:i0 + len(c)] += c
    full = full[:int(dur * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', 'nao_pisca.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(dur * FPS)):
        p.stdin.write(frame(fr / FPS, ev, dur).convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('DUR', dur)


if __name__ == '__main__':
    main()
