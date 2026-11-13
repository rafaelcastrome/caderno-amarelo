# Monta o áudio (narração + trilha de suspense + efeitos + caixinha de música da vó) e junta com o vídeo renderizado,
# legenda palavra por palavra (ASS) e @ que se mexe. Uso: python3 montar.py  (precisa de video.mp4 e tl.json)
import json, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
SR = 48000; TEMPO = 1.1
TL = json.load(open('tl.json')); C = TL['cenas']; DUR = TL['dur']; DD = json.load(open('dados.json')); INI = DD['ini'] + [DUR]
N = int((DUR + 1) * SR)
voz, sfx, mus, cx = (np.zeros(N, np.float32) for _ in range(4))
rng = np.random.default_rng(13)
def wav(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()
def poe(buf, a, t, g=1.0):
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    a = a[:max(0, N - i)]; buf[i:i + len(a)] += a * g
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x).astype(np.float32)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
ruido = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)
def env(n, a, r):
    e = np.ones(n, np.float32); a, r = min(n, max(1, int(a * SR))), min(n, max(1, int(r * SR))); e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e
I = lambda n: INI[n - 1]            # início do plano n (1..32)
Dp = lambda n: INI[n] - INI[n - 1]  # duração do plano n
F = lambda n: C[n - 1]['t']         # início da fala n

# ---------------- narração ----------------
for c in C:
    p = f"falas/{c.get('arq', 'x')}.wav"
    if 'arq' in c and os.path.exists(p):
        a = wav(p, f'atempo={TEMPO}'); a = a / (np.abs(a).max() + 1e-9) * 0.9; poe(voz, a, c['t'])

# ---------------- sintetizadores ----------------
def drone(d, f0):
    x = tt(d); lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * x)
    y = 0.5 * np.sin(2 * np.pi * f0 * x) + 0.3 * np.sin(2 * np.pi * f0 * 1.0595 * x) + 0.22 * np.sin(2 * np.pi * f0 * 0.5 * x) + 0.12 * lp(ruido(d), 160)
    return (y * lfo * env(len(x), 2.0, 1.5)).astype(np.float32)
def batida(d=3.0, f=38):
    x = tt(d); y = np.sin(2 * np.pi * f * x * (1 + 0.6 * np.exp(-x * 6))) * np.exp(-x * 1.6) + 0.5 * lp(ruido(d), 400) * np.exp(-x * 7)
    return (y / np.abs(y).max()).astype(np.float32)
def subida(d):
    x = tt(d); u = x / d; f = 200 + 1500 * u ** 2
    return ((0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(ruido(d), 600, 5000) * 0.6) * u ** 2).astype(np.float32)
def vidro(d, f=1760):
    x = tt(d); y = np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 1.5017 * x)
    return (y * (0.6 + 0.4 * np.sin(2 * np.pi * 5.3 * x)) * env(len(x), 1.5, 1.5) * 0.25).astype(np.float32)
def coracao(d, b0, b1):
    out = np.zeros(int(d * SR), np.float32); t = 0.0
    while t < d - 0.4:
        for dt, g in [(0, 1.0), (0.17, 0.7)]:
            b = (np.sin(2 * np.pi * 48 * tt(0.18)) * np.exp(-tt(0.18) * 22)).astype(np.float32); i = int((t + dt) * SR); b = b[:len(out) - i]; out[i:i + len(b)] += b * g
        t += 60 / (b0 + (b1 - b0) * min(1, t / d))
    return out
x = tt(0.6); TOC = (np.sin(2 * np.pi * 95 * x) * np.exp(-x * 14) + 0.5 * np.sin(2 * np.pi * 260 * x) * np.exp(-x * 25) + 0.25 * bp(ruido(0.6), 800, 3000) * np.exp(-x * 40)).astype(np.float32)
TOC_CIMA = lp(TOC, 500) * 1.4  # batida abafada, vindo de cima
def caixinha(notas, bpm=84):
    # caixinha de música: (nota MIDI, tempos)
    seg = 60 / bpm; tot = sum(b for _, b in notas) * seg + 2; out = np.zeros(int(tot * SR), np.float32); t = 0
    for m, b in notas:
        if m:
            f = 440 * 2 ** ((m - 69) / 12); x = tt(1.8)
            n = (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.01 * x) * np.exp(-x * 3) + 0.15 * np.sin(2 * np.pi * f * 3.98 * x) * np.exp(-x * 6)) * np.exp(-x * 2.6)
            i = int(t * SR); n = n[:len(out) - i]; out[i:i + len(n)] += n.astype(np.float32) * 0.5
        t += b * seg
    return out
# a música da vó (melodia original, lá menor, 3/4)
MUSICA = [(76, 1), (81, 1), (84, 1), (83, 2), (81, 1), (76, 2), (77, 1), (81, 3),
          (79, 1), (77, 1), (76, 1), (74, 2), (76, 1), (72, 1), (71, 1), (69, 4)]
VO_CANTA = caixinha(MUSICA)
def passos(t0, t1, ritmo, g, f=3000, buf=None):
    t = t0
    while t < t1:
        x = tt(0.18); p = lp(ruido(0.18), f) * np.exp(-x * 30) + 0.6 * np.sin(2 * np.pi * 70 * x) * np.exp(-x * 25)
        poe(buf if buf is not None else sfx, p.astype(np.float32), t + rng.uniform(-0.02, 0.02), g * rng.uniform(0.8, 1.1)); t += ritmo
def tique(t0, t1, g=0.25):
    t = t0
    while t < t1:
        x = tt(0.05); k = bp(ruido(0.05), 2500, 7000) * np.exp(-x * 120); poe(sfx, k, t, g); t += 1.0
def clique(t, g=0.6):
    x = tt(0.08); poe(sfx, (bp(ruido(0.08), 1500, 6000) * np.exp(-x * 80)).astype(np.float32), t, g)
def plim(t, g=0.6):
    x = tt(2.0); y = (np.sin(2 * np.pi * 1318.5 * x) * np.exp(-x * 2.5) + np.sin(2 * np.pi * 1046.5 * np.maximum(0, x - 0.18)) * np.exp(-np.maximum(0, x - 0.18) * 2.5) * (x > 0.18)) * 0.5
    poe(sfx, y.astype(np.float32), t, g)
def rangido(d, f=180):
    x = tt(d); y = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.3 * np.sin(2 * np.pi * 3 * x))) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 40 * x)))
    return (bp(y.astype(np.float32), 300, 2500) * env(len(x), 0.1, 0.3)).astype(np.float32)
def zumbido(d, f=120): x = tt(d); return ((np.sin(2 * np.pi * f * x) * 0.6 + 0.3 * np.sin(2 * np.pi * 2 * f * x)) * env(len(x), 0.3, 0.3)).astype(np.float32)

# ---------------- trilha ----------------
poe(mus, drone(I(10) - I(1) + 1, 55.0), 0, 0.22)                    # começo: mistério leve
poe(mus, vidro(I(8) - I(4), 1318), I(4), 0.07)
poe(mus, drone(I(16) - I(10) + 1.5, 49.0), I(10), 0.28)
poe(mus, drone(I(21) - I(16) + 0.5, 43.6), I(16), 0.32)
poe(mus, coracao(I(21) - I(20), 70, 120), I(20), 0.5)
poe(mus, subida(Dp(20)), I(21) - Dp(20), 0.22)
poe(mus, batida(4, 30), I(21) + 0.5, 1.0)                           # apagão
poe(mus, drone(I(29) - I(21), 36.7), I(21) + 0.8, 0.38)
poe(mus, coracao(I(25) - I(22), 75, 95), I(22), 0.35)
poe(mus, batida(3, 40), F(24) + 0.3, 0.45)
poe(mus, batida(3.5, 34), F(25) + 0.6, 0.6)                        # desenhos
poe(mus, subida(Dp(27) * 0.8), I(27) + Dp(27) * 0.2, 0.25); poe(mus, batida(4, 32), F(27) + C[26]['d'] * 0.55, 0.85)  # duas bebês
poe(mus, coracao(Dp(28), 100, 150), I(28), 0.55)
poe(mus, drone(I(32) - I(30) + 1, 41.2), I(30), 0.3)
poe(mus, subida(C[30]['d'] + 0.4), F(31) - 0.2, 0.3)
poe(mus, batida(5, 26), F(31) + C[30]['d'] + 0.1, 1.0); poe(mus, vidro(3, 880), F(31) + C[30]['d'] + 0.3, 0.25)
poe(mus, batida(4, 28), I(32) + Dp(32) * 0.5, 0.9)

# ---------------- efeitos ----------------
x = tt(I(2)); poe(sfx, (lp(ruido(I(2)), 200) * 0.3 + zumbido(I(2), 100) * 0.15) * env(len(x), 0.1, 0.3), 0, 0.5)  # elevador
clique(I(1) + 1.6, 0.5); plim(I(2) - 0.6, 0.35)
x = tt(Dp(2)); poe(sfx, bp(ruido(Dp(2)), 200, 900) * env(len(x), 0.5, 0.5), I(2), 0.25)  # vento/cidade
for n in (3, 4, 8, 9, 13, 14): poe(sfx, zumbido(Dp(n), 120) * 0.15, I(n), 0.5)            # lâmpada fria da escada
x = tt(Dp(6)); poe(sfx, (bp(ruido(Dp(6)), 400, 3000) * 0.08 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * x))) * env(len(x), 0.2, 0.2), I(6), 0.5)  # panela
tique(I(8), I(8) + 1.3, 0.35); passos(I(8) + 1.3, I(8) + 1.3 + (Dp(8) - 1.3) * 0.32, 0.45, 0.35, 1500)
x = tt(0.4); poe(sfx, (np.sin(2 * np.pi * 2100 * x) * np.exp(-x * 18) * 0.4).astype(np.float32), I(8) + 1.3 + (Dp(8) - 1.3) * 0.55, 0.5)  # prato no chão
poe(sfx, vidro(1.2, 2637) * 2, I(9) + Dp(9) * 0.45, 0.3)                                    # brilho
T10 = TL.get('toc10', []); T20 = TL.get('toc20', [])
for k, x in enumerate(T10): poe(sfx, TOC if k < 2 else TOC_CIMA, x - 0.03, 0.9 if k < 2 else 1.0)  # vó bate / bate de volta
poe(cx, VO_CANTA, I(11) + 0.2, 0.55)
x = tt(Dp(13)); poe(sfx, bp(ruido(Dp(13)), 3500, 6000) * (np.sin(2 * np.pi * 9 * x) > 0.6) * 0.08, I(13), 0.5); clique(I(13) + 0.2, 0.4)  # grilos
x = tt(0.7); poe(sfx, bp(ruido(0.7), 1500, 6000) * env(len(x), 0.05, 0.5) * 0.4, I(14) + Dp(14) * 0.5, 0.5)  # papel
poe(sfx, bp(ruido(1.0), 1500, 6000) * env(int(SR), 0.05, 0.6) * 0.3, I(15) + Dp(15) * 0.5, 0.5)
x = tt(Dp(16) + Dp(17)); sir = np.sign(np.sin(2 * np.pi * np.where((x * 1.2) % 1 < 0.5, 700, 930) * x)) * 0.2
poe(sfx, lp(sir.astype(np.float32), 2500) * env(len(x), 0.4, 1.0), I(16), 0.35)
passos(I(18), I(18) + Dp(18) * 0.8, 0.5, 0.35, 1800)
tique(I(19), I(20), 0.35)
for k, x in enumerate(T20): poe(sfx, TOC_CIMA, x - 0.03, 1.0 + 0.06 * k)
x = tt(1.5); poe(sfx, (lp(ruido(1.5), 300) * np.exp(-x * 3) + np.sin(2 * np.pi * 60 * x * np.exp(-x)) * np.exp(-x * 2)).astype(np.float32), I(21) + 0.5, 0.8)  # apagão
passos(I(22) + 0.2, I(22) + Dp(22) * 0.9, 0.42, 0.45, 1200); clique(I(22) + 0.1, 0.5)
x = tt(Dp(22)); poe(sfx, bp(ruido(Dp(22)), 500, 2500) * np.maximum(0, np.sin(2 * np.pi * 0.9 * x)) ** 2 * 0.25, I(22), 0.5)  # respiração
x = tt(Dp(23) * 0.5); poe(sfx, bp(ruido(Dp(23) * 0.5), 2000, 8000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 15 * x))) * 0.3, I(23) + 0.3, 0.5)  # raspando a tinta
x = tt(0.25); poe(sfx, (bp(ruido(0.25), 800, 3000) * np.exp(-x * 20)).astype(np.float32), I(23) + Dp(23) * 0.85, 0.6)  # clique da chave
poe(sfx, rangido(2.2, 160), I(24) + 0.1, 0.5)                                                 # porta range
for k in range(int(Dp(26) / 1.3) + 1): poe(sfx, rangido(0.6, 220 - k * 8), I(26) + k * 1.3, 0.25)   # cadeira de balanço
poe(cx, VO_CANTA, I(28) + 0.3, 0.32)
passos(I(28) + Dp(28) * 0.65, I(29), 0.22, 0.6, 2500)
x = tt(0.8); poe(sfx, (bp(ruido(0.8), 2000, 9000) * np.exp(-x * 6) + np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 10) * 0.3).astype(np.float32), I(28) + Dp(28) * 0.66, 0.7)  # prato quebra
x = tt(1.0); poe(sfx, (zumbido(1.0, 60) * np.minimum(1, x * 3)).astype(np.float32), I(29), 0.4)  # luz volta
x = tt(Dp(29)); poe(sfx, bp(ruido(Dp(29)), 500, 2500) * np.maximum(0, np.sin(2 * np.pi * 1.6 * x)) ** 2 * 0.35 * np.exp(-x * 0.3), I(29), 0.5)  # ofegante
poe(cx, VO_CANTA, I(30) + 0.3, 0.5)
clique(I(32) + 0.3, 0.3); plim(I(32) + Dp(32) * 0.5, 0.7)

# ---------------- mistura ----------------
envv = np.convolve(np.abs(voz), np.ones(4800) / 4800, 'same'); duck = 1 - 0.65 * np.clip(envv / 0.03, 0, 1)
duck = np.convolve(duck, np.ones(9600) / 9600, 'same').astype(np.float32)
mix = voz + sfx * (0.55 + 0.35 * duck) * 0.8 + mus * duck * 0.6 + cx * (0.45 + 0.55 * duck)
mix = mix / np.abs(mix).max() * 0.92
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', 'audio.wav'], input=mix[:int(DUR * SR)].tobytes(), check=True)
print('audio.wav', round(DUR, 1), 's')
