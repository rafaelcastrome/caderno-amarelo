"""Conta os passes: bola + dinossauro escondido + folha que muda de cor. Gera conta_os_passes.mp4.
Uso: python3 video.py            -> vídeo completo
     python3 video.py 1.0 12.5   -> só os quadros nesses segundos (prev_*.png)
Falas: falas/antonio/fala0..5.mp3 (Microsoft Antonio, edge-tts +12%).
"""
import json, math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cena

W, H, FPS = 1080, 1920, 30
TEMPO = 1.0
F = lambda s: ImageFont.truetype('Caveat-Bold.ttf', s)
INK = (30, 30, 30); RED = (214, 40, 40); BLUE = (53, 103, 160); GREEN = (40, 150, 70)
REPLAY = 2.5          # velocidade do replay


def carrega_falas():
    """um mp3 por fala (Antonio, gravado no PC do Rafael), sem silêncio nas pontas"""
    sr = 24000; clips = []
    for i in range(6):
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'falas/antonio/fala{i}.mp3', '-af',
                            'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                            '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True).stdout
        clips.append(np.frombuffer(r, np.int16))
    return sr, clips


def monta(d):
    ev = {}; t = 0.05
    ev['f0'] = (t, t + d[0]); t += d[0] + 0.2
    ev['conta'] = (t, t + cena.CONTA); t += cena.CONTA + 0.2
    ev['f1'] = (t, t + d[1]); t += d[1] + 0.3
    ev['f2'] = (t, t + d[2]); t += d[2] + 0.2
    rp = (cena.DINO_OUT - cena.DINO_IN + 1.0) / REPLAY
    ev['replay'] = (t, t + rp)
    ev['f3'] = (t + 0.3, t + 0.3 + d[3]); t += max(rp, d[3] + 0.3) + 0.3
    ev['f4'] = (t, t + d[4]); t += d[4] + 0.2
    ev['f5'] = (t, t + d[5]); t += d[5] + 0.8
    return ev, t


def txt(s, size, fill, stroke=True):
    f = F(size); l, t, r, b = f.getbbox(s)
    im = Image.new('RGBA', (r - l + 30, b - t + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((15 - l, 15 - t), s, font=f, fill=fill,
                            stroke_width=7 if stroke else 0, stroke_fill=(255, 255, 255))
    return im


_c = {}
def T(s, size, fill):
    k = (s, size, fill)
    if k not in _c: _c[k] = txt(s, size, fill)
    return _c[k]


def pop(im, s, size, fill, y, t, a, x=None):
    img = T(s, size, fill)
    k = 1 if a is None else min(1, max(0, (t - a) / 0.18))
    if k <= 0: return
    esc = 1.4 - 0.4 * (k * k * (3 - 2 * k))
    i2 = img.resize((int(img.width * esc), int(img.height * esc)), Image.LANCZOS)
    cx = W // 2 if x is None else x
    im.paste(i2, (cx - i2.width // 2, y - (i2.height - img.height) // 2), i2)


WM = txt('@Cardeno_Amarelo', 52, (150, 140, 120), stroke=False)


def antes_depois(t, a):
    """metade esquerda = folha no começo, direita = no fim"""
    i0 = cena.quadro(0.0, cor_k=0.0); i1 = cena.quadro(0.0, cor_k=1.0)
    k = min(1, max(0, (t - a) / 0.6)); k = k * k * (3 - 2 * k)
    corte = int(W - (W // 2) * k)
    im = i1.copy(); im.paste(i0.crop((0, 0, corte, H)), (0, 0))
    d = ImageDraw.Draw(im); d.line([(corte, 380), (corte, 1520)], fill=INK, width=8)
    if k >= 1:
        pop(im, 'COMEÇO', 90, INK, 1420, t, a + 0.6, x=W // 4)
        pop(im, 'FIM', 90, INK, 1420, t, a + 0.6, x=3 * W // 4)
    return im


_cache_q = {}


def frame(t, ev):
    # ---------- imagem de fundo ----------
    if t < ev['conta'][0]:
        im = cena.quadro(0.0)
    elif t < ev['conta'][1]:
        im = cena.quadro(t - ev['conta'][0])
    elif t < ev['replay'][0]:
        im = cena.quadro(cena.CONTA - 1e-3)
    elif t < ev['replay'][1]:
        u = cena.DINO_IN - 0.5 + (t - ev['replay'][0]) * REPLAY
        im = cena.quadro(u, cor_k=1.0, circula=True)
    elif t < ev['f4'][0] + 0.9:
        im = cena.quadro(cena.CONTA - 1e-3)
    elif t < ev['f5'][0]:
        im = antes_depois(t, ev['f4'][0] + 0.9)
    else:
        im = cena.quadro(0.0)

    # ---------- textos ----------
    if t < ev['conta'][1]:
        pop(im, 'Conta quantas vezes', 112, INK, 70, t, None)
        pop(im, 'a bola passa!', 130, RED, 195, t, None)
        if t >= ev['f0'][1] - 0.4 and t < ev['conta'][0] + 0.8:
            pop(im, 'VALENDO!', 150, GREEN, 1480, t, ev['f0'][1] - 0.4)
    elif t < ev['f2'][0]:
        pop(im, 'Quantos deu?', 130, INK, 90, t, ev['f1'][0])
        if t >= ev['f1'][0] + 0.9:
            pop(im, '13 passes!', 170, RED, 1440, t, ev['f1'][0] + 0.9)
    elif t < ev['replay'][0]:
        pop(im, 'Mas peraí...', 130, INK, 70, t, ev['f2'][0])
        pop(im, 'viu o dinossauro?', 130, RED, 200, t, ev['f2'][0] + 0.6)
    elif t < ev['f4'][0]:
        pop(im, 'Ele passou', 130, INK, 70, t, ev['replay'][0])
        pop(im, 'bem no meio!', 140, RED, 200, t, ev['replay'][0] + 0.3)
        if t < ev['replay'][1]:
            pop(im, 'REPLAY', 90, RED, 1480, t, ev['replay'][0])
    elif t < ev['f5'][0]:
        pop(im, 'E a folha...', 130, INK, 70, t, ev['f4'][0])
        pop(im, 'mudou de cor!', 140, RED, 200, t, ev['f4'][0] + 0.9)
    else:
        pop(im, 'Comenta:', 130, INK, 70, t, ev['f5'][0])
        pop(im, 'vi ou não vi?', 150, RED, 200, t, ev['f5'][0] + 0.3)
        pop(im, 'volta e confere!', 110, BLUE, 1460, t, ev['f5'][0] + 1.2)

    pos = [(560, 1840), (130, 1840), (560, 1730), (130, 1730)][int(t // 5) % 4]
    im.paste(WM, pos, WM)
    return im


def tuc(sr):
    n = int(0.06 * sr); x = np.arange(n) / sr
    return (np.sin(2 * np.pi * 180 * x) * np.exp(-x * 60) * 9000).astype(np.float32)


def main():
    sr, clips = carrega_falas()
    dur = [len(c) / sr / TEMPO for c in clips]
    ev, DUR = monta(dur)
    sel = [float(s) for s in sys.argv[1:]]
    if sel:
        for s in sel: frame(s, ev).save(f'prev_{s}.png')
        print(ev, 'DUR', DUR); return
    full = np.zeros(int(DUR * sr) + sr, np.float32)
    for i, c in enumerate(clips):
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-af', f'atempo={TEMPO}', '-f', 's16le', '-'], input=c.tobytes(), capture_output=True).stdout
        a = np.frombuffer(r, np.int16).astype(np.float32); i0 = int(ev[f'f{i}'][0] * sr)
        full[i0:i0 + len(a)] += a[:len(full) - i0]
    # "tuc" a cada vez que a bola sai da mão
    tk = tuc(sr); dp = cena.CONTA / cena.N
    for j in range(cena.N):
        i0 = int((ev['conta'][0] + j * dp + 0.3 * dp) * sr); full[i0:i0 + len(tk)] += tk
    full = full[:int(DUR * sr)]
    with wave.open('voz_montada.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz_montada.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao.wav'], check=True)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'narracao.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                          'conta_os_passes.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)):
        p.stdin.write(frame(fr / FPS, ev).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    print('DUR', DUR)


if __name__ == '__main__':
    main()
