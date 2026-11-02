"""Olho com listras (efeito cachoeira / motion aftereffect), fiel à referência do Rafael. Gera olho_listras.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 45     -> só os quadros nesses segundos (prev_*.png)
Falas: falas/antonio/fala0..7.mp3 (Microsoft Antonio, gravado no PC do Rafael).
"""
import math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cena

W, H, FPS = 1080, 1920, 30
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160)
PAPER = (251, 245, 223); YEL = (245, 197, 24)
CORTE = 42.0                       # fim da encarada
INICIO_FALAS = [0.3, 9.0, 19.0, 29.0]


def carrega_falas():
    sr = 24000; clips = []
    for i in range(8):
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'falas/antonio/fala{i}.mp3', '-af',
                            'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                            '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True).stdout
        clips.append(np.frombuffer(r, np.int16))
    return sr, clips


def monta(d):
    ev = {}
    for i, a in enumerate(INICIO_FALAS): ev[i] = (a, a + d[i])
    ev[4] = (CORTE - d[4] - 0.05, CORTE - 0.05)
    t = CORTE + 0.15
    ev[5] = (t, t + d[5]); t += d[5] + 0.5
    ev[6] = (t, t + d[6]); t += d[6] + 0.5
    ev[7] = (t, t + d[7]); t += d[7] + 0.6
    return ev, t + 0.5          # 0,5 s finais voltam pras listras (loop)


def txt(s, size, fill, stroke=(255, 255, 255), sw=7):
    f = F(size); l, t, r, b = f.getbbox(s)
    im = Image.new('RGBA', (r - l + 30, b - t + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((15 - l, 15 - t), s, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke)
    return im


_c = {}
def T(s, size, fill, stroke=(255, 255, 255)):
    k = (s, size, fill, stroke)
    if k not in _c: _c[k] = txt(s, size, fill, stroke)
    return _c[k]


def caixa(im, s, size, fill, y):
    """texto numa plaquinha branca (fica parado, não atrapalha o efeito)"""
    img = T(s, size, fill); x = (W - img.width) // 2
    d = ImageDraw.Draw(im); d.rounded_rectangle([x - 10, y - 6, x + img.width + 10, y + img.height + 2], 26, fill=(255, 255, 255), outline=INK, width=5)
    im.paste(img, (x, y), img)


# ---------- desenho do depois: rosto grande no caderno ----------
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(30, W, 54):
        d.line([(x, 0), (x, H)], fill=(205, 214, 214) if (x - 30) % 216 else (186, 201, 212), width=1 if (x - 30) % 216 else 2)
    for y in range(30, H, 54):
        d.line([(0, y), (W, y)], fill=(205, 214, 214) if (y - 30) % 216 else (186, 201, 212), width=1 if (y - 30) % 216 else 2)
    d.rectangle([88, 0, 90, H], fill=(236, 170, 150)); return im


def rosto():
    im = paper(); S = 2
    lay = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    s = lambda *v: [c * S for c in v]; lw = 12 * S
    cx, cy = 540, 1000
    d.ellipse(s(cx - 400, cy - 470, cx + 400, cy + 470), fill=(255, 214, 120), outline=INK, width=lw)   # cabeça
    for k in range(9):                                                                                  # cabelo
        x0 = cx - 360 + k * 90
        d.arc(s(x0 - 70, cy - 560, x0 + 110, cy - 360), 180, 360, fill=INK, width=lw)
    for ex in (-170, 170):                                                                              # olhos
        d.ellipse(s(cx + ex - 95, cy - 200, cx + ex + 95, cy - 40), fill=(255, 255, 255), outline=INK, width=lw)
        d.ellipse(s(cx + ex - 45, cy - 155, cx + ex + 45, cy - 65), fill=(60, 140, 170), outline=INK, width=6 * S)
        d.ellipse(s(cx + ex - 20, cy - 130, cx + ex + 20, cy - 90), fill=INK)
        d.ellipse(s(cx + ex - 30, cy - 150, cx + ex - 12, cy - 132), fill=(255, 255, 255))
        d.arc(s(cx + ex - 110, cy - 280, cx + ex + 110, cy - 190), 200, 340, fill=INK, width=lw)        # sobrancelha
    d.line(s(cx, cy - 30, cx - 40, cy + 90), fill=INK, width=lw); d.line(s(cx - 40, cy + 90, cx + 20, cy + 95), fill=INK, width=lw)
    d.chord(s(cx - 210, cy + 80, cx + 210, cy + 330), 0, 180, fill=(170, 40, 50), outline=INK, width=lw)  # boca
    d.rectangle(s(cx - 160, cy + 205, cx + 160, cy + 235), fill=(255, 255, 255))
    for ex in (-300, 300):
        d.ellipse(s(cx + ex - 60, cy + 40, cx + ex + 60, cy + 110), fill=(245, 140, 120))                 # bochechas
    lay = lay.resize((W, H), Image.LANCZOS); im.paste(lay, (0, 0), lay)
    return im


ROSTO = rosto()
WM = txt('@Cardeno_Amarelo', 50, (235, 235, 235), stroke=(30, 30, 30), sw=4)
WM2 = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=PAPER, sw=0)


def frame(t, ev, DUR):
    if t < CORTE or t >= DUR - 0.5:
        im = cena.listras(t if t < CORTE else 0.0)
        if t < CORTE:
            caixa(im, 'NÃO PISCA!', 120, RED, 90)
            falta = max(0, math.ceil(CORTE - t))
            caixa(im, f'olha no olho · {falta} s', 80, INK, 1700)
        wm = WM; pos = [(600, 1560), (120, 1560), (600, 260), (120, 260)][int(t // 10) % 4]
    else:
        im = ROSTO.copy()
        if t >= ev[5][0]:
            caixa(im, 'Tá encolhendo?', 120, RED, 90)
        if t >= ev[6][0]:
            caixa(im, 'olha pra tua mão!', 96, BLUE, 1700)
        if t >= ev[7][0] + 4.5:
            caixa(im, 'efeito cachoeira', 96, INK, 240)
        wm = WM2; pos = [(560, 1840), (130, 1840)][int(t // 5) % 2]
    im.paste(wm, pos, wm)
    return im


def main():
    sr, clips = carrega_falas()
    dur = [len(c) / sr for c in clips]
    ev, DUR = monta(dur)
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, ev, DUR).save(f'prev_{s}.png')
        print(ev, 'DUR', DUR); return
    full = np.zeros(int(DUR * sr) + sr, np.float32)
    for i, c in enumerate(clips):
        i0 = int(ev[i][0] * sr); a = c.astype(np.float32); full[i0:i0 + len(a)] += a[:len(full) - i0]
    full = full[:int(DUR * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'olho_listras.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, ev, DUR).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
