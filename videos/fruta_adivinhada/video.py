"""A resposta tava na tela o tempo todo: força 11 -> K -> kiwi; o kiwi está rabiscado
no canto da folha desde o quadro 0. Gera fruta_adivinhada.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
"""
import numpy as np, subprocess, math, sys, wave
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
TEMPO = 1.1
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
PEN = (40, 70, 150); PAPER = (251, 245, 223); YEL = (245, 197, 24)

# (arquivo, início, fim, pausa depois) — cortes no meio dos silêncios
CLIPS = [('take1', 0.00, 2.95, 0.2),   # 0 Eu já sei a fruta... duvida? Bora!
         ('take1', 3.00, 5.55, 0.7),    # 1 Pensa num número de um a dez... pensou?
         ('take1', 5.60, 7.30, 0.8),    # 2 Multiplica por dois!
         ('take1', 8.00, 11.30, 0.9),   # 3 Agora soma vinte e dois!
         ('take1', 16.00, 17.45, 0.8),  # 4 Divide por dois!
         ('take1', 22.85, 25.45, 1.0),  # 5 Agora tira o número que tu pensou
         ('take1', 30.45, 32.65, 0.05), # 6 O número que sobrou... vira uma letra!
         ('take2', 0.00, 2.90, 1.2),    # 7 A é um, B é dois... conta aí!
         ('take2', 4.40, 7.80, 1.1),    # 8 Achou a letra? Agora pensa numa fruta...
         ('take2', 9.50, 10.28, 0.5),   # 9 Pensou?
         ('take2', 10.28, 11.30, 0.4),  # 10 Kiwi, né?
         ('take2', 12.95, 16.70, 0.3),  # 11 Olha ali no cantinho...
         ('take2', 18.30, 19.50, 0.6)]  # 12 Volta e confere!


def carrega():
    out = []
    for f, a, b, g in CLIPS:
        with wave.open(f + '.wav') as w:
            sr = w.getframerate(); pcm = np.frombuffer(w.readframes(w.getnframes()), np.int16)
        c = pcm[int(a * sr):int(b * sr)].astype(np.float32)
        n = int(0.008 * sr); c[:n] *= np.linspace(0, 1, n); c[-n:] *= np.linspace(1, 0, n)
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-af', f'atempo={TEMPO}', '-f', 's16le', '-'], input=c.astype(np.int16).tobytes(),
                           capture_output=True).stdout
        out.append(np.frombuffer(r, np.int16).astype(np.float32))
    return sr, out


def linha(sr, clips):
    ev = []; t = 0.15
    for i, c in enumerate(clips):
        d = len(c) / sr; ev.append((t, t + d)); t += d + CLIPS[i][3]
    return ev, t + 0.2


# ---------- desenho ----------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


def arte(desenha, w, h):
    lay = Image.new('RGBA', (w * 2, h * 2), (0, 0, 0, 0))
    desenha(ImageDraw.Draw(lay), 2)
    return lay.resize((w, h), Image.LANCZOS)


# rabiscos de caneta na parte de baixo da folha (o kiwi é o "solzinho" do canto)
KX, KY = 935, 1575        # centro do kiwi rabiscado


def rabisco_kiwi(d, s, cor=PEN, colorido=False):
    c = 70 * s; R = 52 * s; lw = int(4 * s)
    if colorido:
        d.ellipse([c - R, c - R, c + R, c + R], fill=(140, 100, 60))
        d.ellipse([c - R + 7 * s, c - R + 7 * s, c + R - 7 * s, c + R - 7 * s], fill=(120, 190, 60))
        d.ellipse([c - 14 * s, c - 14 * s, c + 14 * s, c + 14 * s], fill=(235, 240, 200))
    d.ellipse([c - R, c - R, c + R, c + R], outline=cor, width=lw)
    d.ellipse([c - 14 * s, c - 14 * s, c + 14 * s, c + 14 * s], outline=cor, width=lw)
    for k in range(10):
        a = k * math.tau / 10; r = 24 * s
        x, y = c + r * math.cos(a), c + r * math.sin(a)
        d.ellipse([x - 4 * s, y - 4 * s, x + 4 * s, y + 4 * s], fill=(25, 25, 25) if colorido else cor)
        x2, y2 = c + 40 * s * math.cos(a), c + 40 * s * math.sin(a)
        x1, y1 = c + 30 * s * math.cos(a), c + 30 * s * math.sin(a)
        d.line([(x1, y1), (x2, y2)], fill=cor, width=max(1, int(2.5 * s)))


def rabiscos(d, s):
    lw = int(4 * s)
    # estrela
    cx, cy = 200 * s, 1555 * s; pts = []
    for k in range(10):
        r = (46 if k % 2 == 0 else 20) * s; a = -math.pi / 2 + k * math.pi / 5
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.line(pts + [pts[0]], fill=PEN, width=lw, joint='curve')
    # coração
    cx, cy = 390 * s, 1625 * s
    hp = [(cx + 3 * s * 16 * math.sin(u) ** 3, cy - 3 * s * (13 * math.cos(u) - 5 * math.cos(2 * u) - 2 * math.cos(3 * u) - math.cos(4 * u)))
          for u in np.linspace(0, math.tau, 80)]
    d.line(hp, fill=PEN, width=lw, joint='curve')
    # espiral
    cx, cy = 560 * s, 1580 * s
    sp = [(cx + 4.2 * s * u * math.cos(u), cy + 4.2 * s * u * math.sin(u)) for u in np.linspace(0, 11, 120)]
    d.line(sp, fill=PEN, width=lw, joint='curve')
    # nuvem
    cx, cy = 745 * s, 1630 * s
    for dx, dy, r in [(-38, 8, 26), (-8, -14, 34), (30, 0, 28), (0, 18, 24)]:
        d.arc([cx + (dx - r) * s, cy + (dy - r) * s, cx + (dx + r) * s, cy + (dy + r) * s], 140, 400, fill=PEN, width=lw)
    d.line([(cx - 64 * s, cy + 30 * s), (cx + 58 * s, cy + 30 * s)], fill=PEN, width=lw)


def base_img():
    im = paper()
    lay = arte(lambda d, s: rabiscos(d, s), W, H); im.paste(lay, (0, 0), lay)
    k = arte(lambda d, s: rabisco_kiwi(d, s), 140, 140); im.paste(k, (KX - 70, KY - 70), k)
    return im


def kiwi_grande(d, s):
    c = 260 * s; R = 230 * s
    d.ellipse([c - R + 14 * s, c - R + 22 * s, c + R + 14 * s, c + R + 22 * s], fill=(0, 0, 0, 45))
    d.ellipse([c - R, c - R, c + R, c + R], fill=(150, 108, 62), outline=INK, width=int(9 * s))
    r2 = R - 26 * s
    for k in range(40):  # polpa: verde escuro na borda clareando pro meio
        r = r2 * (1 - k / 40); g = k / 40
        cor = (int(90 + 70 * g), int(165 + 55 * g), int(40 + 60 * g))
        d.ellipse([c - r, c - r, c + r, c + r], fill=cor)
    for k in range(48):  # raios claros
        a = k * math.tau / 48
        d.line([(c + 70 * s * math.cos(a), c + 70 * s * math.sin(a)), (c + 175 * s * math.cos(a), c + 175 * s * math.sin(a))],
               fill=(190, 225, 140), width=int(3 * s))
    d.ellipse([c - 62 * s, c - 50 * s, c + 62 * s, c + 50 * s], fill=(245, 245, 215))
    for k in range(22):  # sementes em gota
        a = k * math.tau / 22; r = 95 * s + (k % 2) * 16 * s
        x, y = c + r * math.cos(a), c + r * math.sin(a)
        ca, sa = math.cos(a), math.sin(a)
        p = [(x + 16 * s * ca, y + 16 * s * sa), (x - 7 * s * sa, y + 7 * s * ca), (x - 12 * s * ca, y - 12 * s * sa), (x + 7 * s * sa, y - 7 * s * ca)]
        d.polygon(p, fill=(25, 22, 20))


BASE = base_img()
KIWI = arte(kiwi_grande, 540, 560)
KIWI_COR = arte(lambda d, s: rabisco_kiwi(d, s, colorido=True), 140, 140)


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


def ease(k): k = min(1, max(0, k)); return k * k * (3 - 2 * k)


def escrito(im, s, size, fill, y, t, a):
    img = T(s, size, fill); x = (W - img.width) // 2
    p = 1 if a is None else min(1, max(0, (t - a) / 0.3))
    if p <= 0: return
    c = img.crop((0, 0, max(1, int(img.width * p)), img.height)); im.paste(c, (x, y), c)


def pop(im, s, size, fill, cy, t, a):
    img = T(s, size, fill); k = (t - a) / 0.2
    if k <= 0: return
    e = 1.45 - 0.45 * ease(k)
    i2 = img.resize((int(img.width * e), int(img.height * e)), Image.LANCZOS)
    im.paste(i2, ((W - i2.width) // 2, cy - i2.height // 2), i2)


CARD = (110, 520, 970, 1400)


def card(im):
    def dc(d, s):
        x0, y0, x1, y1 = [v * s for v in (0, 0, CARD[2] - CARD[0], CARD[3] - CARD[1])]
        d.rounded_rectangle([x0 + 24, y0 + 32, x1 - 0, y1 - 0], 50 * s, fill=(0, 0, 0, 40))
        d.rounded_rectangle([x0 + 6, y0 + 6, x1 - 24, y1 - 30], 50 * s, fill=(255, 255, 255, 255), outline=INK, width=10 * s // 2)
    if not hasattr(card, 'img'):
        card.img = arte(dc, CARD[2] - CARD[0], CARD[3] - CARD[1])
    im.paste(card.img, CARD[:2], card.img)


PASSOS = {2: ('× 2', BLUE), 3: ('+ 22', GREEN), 4: ('÷ 2', BLUE), 5: ('− o teu', RED)}


def conteudo(im, t, ev):
    """o que vai dentro do cartão"""
    cy = (CARD[1] + CARD[3]) // 2 - 20
    cur = max([i for i, (a, b) in enumerate(ev) if t >= a - 0.05] or [0])
    if cur == 0:
        pop(im, '?', 520, RED, cy, t, 0.0)
        return
    if cur == 1:
        pop(im, '1 a 10', 260, INK, cy - 60, t, ev[1][0])
        escrito(im, 'pensa num número', 100, BLUE, cy + 120, t, ev[1][0] + 0.3)
        return
    if cur in PASSOS:
        s, cor = PASSOS[cur]
        img = T(f'passo {cur - 1} de 4', 70, (120, 120, 120)); im.paste(img, ((W - img.width) // 2, CARD[1] + 50), img)
        pop(im, s, 300 if cur != 5 else 210, cor, cy, t, ev[cur][0])
        if cur == 5: escrito(im, 'número do começo', 96, INK, cy + 140, t, ev[cur][0] + 0.4)
        return
    if cur in (6, 7):
        pop(im, 'número = letra', 150, INK, cy - 190, t, ev[6][0])
        escrito(im, '1 = A', 140, BLUE, cy - 60, t, ev[7][0])
        escrito(im, '2 = B', 140, BLUE, cy + 70, t, ev[7][0] + 0.6)
        escrito(im, '3 = C ...', 140, BLUE, cy + 200, t, ev[7][0] + 1.2)
        return
    if cur in (8, 9):
        pop(im, 'uma FRUTA', 170, GREEN, cy - 140, t, ev[8][0] + 0.9)
        escrito(im, 'com essa letra', 110, INK, cy + 10, t, ev[8][0] + 1.3)
        if cur == 9: pop(im, 'pensou?', 140, RED, cy + 190, t, ev[9][0])
        return
    if cur == 10:
        k = ease((t - ev[10][0]) / 0.3)
        if k > 0:
            e = 0.4 + 0.6 * k + 0.08 * math.sin(min(1, (t - ev[10][0]) / 0.5) * math.pi)
            ki = KIWI.resize((int(KIWI.width * e), int(KIWI.height * e)), Image.LANCZOS)
            im.paste(ki, ((W - ki.width) // 2, cy - 30 - ki.height // 2), ki)
        pop(im, 'KIWI!', 170, GREEN, CARD[3] - 130, t, ev[10][0] + 0.25)
        return
    # 11, 12: kiwi menor no cartão
    ki = KIWI.resize((380, 394), Image.LANCZOS); im.paste(ki, ((W - 380) // 2, cy - 230), ki)
    img = T('KIWI!', 150, GREEN); im.paste(img, ((W - img.width) // 2, CARD[3] - 210), img)


def cabecalho(im, t, ev):
    cur = max([i for i, (a, b) in enumerate(ev) if t >= a - 0.05] or [0])
    if cur == 0 or cur == 12:
        escrito(im, 'Eu já sei a fruta', 124, INK, 90, t, None)
        escrito(im, 'que tu vai pensar!', 124, RED, 225, t, None)
    elif cur <= 5:
        escrito(im, 'Faz de cabeça,', 124, INK, 90, t, None)
        escrito(im, 'bem rápido!', 124, RED, 225, t, None)
    elif cur <= 9:
        escrito(im, 'Agora vira', 124, INK, 90, t, None)
        escrito(im, 'uma LETRA!', 124, RED, 225, t, None)
    elif cur == 10:
        escrito(im, 'Acertei?', 150, RED, 120, t, ev[10][0])
    else:
        escrito(im, 'Tava aqui desde', 124, INK, 90, t, ev[11][0])
        escrito(im, 'o 1º segundo!', 124, RED, 225, t, ev[11][0] + 0.4)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=0)


def frame(t, ev, dur):
    im = BASE.copy()
    card(im); conteudo(im, t, ev); cabecalho(im, t, ev)
    a11 = ev[11][0]
    if t >= a11:
        # o rabisco do canto ganha cor e um círculo vermelho
        k = ease((t - a11) / 0.5)
        kc = KIWI_COR.copy(); kc.putalpha(kc.getchannel('A').point(lambda v: int(v * k)))
        im.paste(kc, (KX - 70, KY - 70), kc)
        d = ImageDraw.Draw(im); R = 95
        n = int(360 * ease((t - a11 - 0.3) / 0.5))
        if n > 0: d.arc([KX - R, KY - R, KX + R, KY + R], -90, -90 + n, fill=RED, width=10)
    # zoom no canto: entra no "cantinho da folha", sai no "volta e confere"
    z = 0.0
    if t >= a11 + 0.6:
        z = ease((t - a11 - 0.6) / 0.6)
    if t >= ev[12][0]:
        z = 1 - ease((t - ev[12][0]) / 0.5)
    if z > 0:
        zz = 1 + 0.6 * z
        cx = W / 2 + (KX - 120 - W / 2) * z; cy = H / 2 + (KY - 300 - H / 2) * z
        w2, h2 = W / zz, H / zz
        x0 = min(max(0, cx - w2 / 2), W - w2); y0 = min(max(0, cy - h2 / 2), H - h2)
        im = im.crop((int(x0), int(y0), int(x0 + w2), int(y0 + h2))).resize((W, H), Image.LANCZOS)
    if t >= a11 + 0.9 and t < ev[12][0]:
        for s_, sz, y_, a_ in [('tava aqui desde', 110, 1150, 0.9), ('o começo!', 130, 1270, 1.15)]:
            if t >= a11 + a_:
                img = T(s_, sz, RED); im.paste(img, (70, y_), img)
    pos = [(560, 1840), (130, 1840), (560, 1720), (130, 1720)][int(t // 5) % 4]
    im.paste(WM, pos, WM)
    return im


def main():
    sr, clips = carrega(); ev, dur = linha(sr, clips)
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, ev, dur).save(f'prev_{s}.png')
        print([(round(a, 2), round(b, 2)) for a, b in ev], 'DUR', round(dur, 2)); return
    full = np.zeros(int(dur * sr) + sr, np.float32)
    for (a, b), c in zip(ev, clips):
        i0 = int(a * sr); full[i0:i0 + len(c)] += c[:len(full) - i0]
    full = full[:int(dur * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', 'fruta_adivinhada.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(dur * FPS)):
        p.stdin.write(frame(fr / FPS, ev, dur).convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('DUR', dur)


if __name__ == '__main__':
    main()
