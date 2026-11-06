# Efeitos do filme (numpy): passos, avião, assobio da bomba, explosão, zumbido no ouvido, fogo.
import numpy as np, wave, json, sys
from build import CENAS
SR = 44100; ini = np.cumsum([0] + [c[0] for c in CENAS]); TOT = ini[-1]
out = np.zeros(int(TOT * SR) + SR); rng = np.random.default_rng(3)
def add(sig, t, g=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def lp(x, a):  # passa-baixa simples
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def lpf(x, a):  # vetorizado (scipy)
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)
def env(n, at, dec):
    t = np.arange(n) / SR; return np.minimum(1, t / max(at, 1e-4)) * np.exp(-t / dec)
def passo(g=0.5):
    n = int(0.12 * SR); x = lpf(rng.standard_normal(n), 0.08) * env(n, 0.003, 0.025)
    t = np.arange(n) / SR; x += np.sin(2 * np.pi * 90 * t) * env(n, 0.002, 0.03) * 0.6
    return x * g
def sm(k): k = np.clip(k, 0, 1); return k * k * (3 - 2 * k)
def trilha(mov):  # [[t, x], ...] com easing suave (igual ao K do ator.js)
    def f(t):
        if t <= mov[0][0]: return mov[0][1]
        for a, b in zip(mov, mov[1:]):
            if t <= b[0]:
                k = (t - a[0]) / (b[0] - a[0]); k = k if (len(b) > 3 and b[3] == 'lin') else sm(k); return a[1] + (b[1] - a[1]) * k
        return mov[-1][1]
    return f
def passos(cena, mov, g=0.45):
    f = trilha(mov); d = 0; ant = f(0); prox = 0.5 - 0.15 % 0.5; T = mov[-1][0]
    for i in range(1, int(T * 200) + 1):
        t = i / 200; x = f(t); d += abs(x - ant); ant = x
        if d >= prox: add(passo(g * (0.8 + 0.4 * rng.random())), ini[cena - 1] + t); prox += 0.5
def fogo(c, g=0.4, a=0):
    t0 = ini[c - 1] + a; dur = CENAS[c - 1][0] - a; n = int(dur * SR)
    cr = np.zeros(n); idx = rng.integers(0, n, int(dur * 25)); cr[idx] = rng.standard_normal(len(idx))
    add((lpf(cr, 0.3) * 0.8 + lpf(rng.standard_normal(n), 0.01) * 0.6) * np.interp(np.arange(n) / SR, [0, 0.5, dur - 0.3, dur], [0, g, g, 0]), t0)
def bum(dur, g, grave=40):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lpf(rng.standard_normal(n), 0.02) * 6 + np.sin(2 * np.pi * grave * t * (1 - 0.3 * t / dur)) * 0.8
    return np.tanh(x * env(n, 0.01, dur / 4)) * g
# 1 trem chegando (desacelera) + apito
c = 1; t0 = ini[0]; dur = CENAS[0][0]; n = int(dur * SR); t = np.arange(n) / SR
rate = np.interp(t, [0, 5.5, 6.6, dur], [3.0, 1.2, 0.0, 0.0]); ph = np.cumsum(rate / SR)
pulso = (np.sin(2 * np.pi * ph * 2) > 0.6).astype(float)
add(lpf(rng.standard_normal(n), 0.06) * lpf(pulso, 0.01) * 2.5 * np.interp(t, [0, 0.6, dur], [0, 0.35, 0.2]), t0)
add(np.sin(2 * np.pi * 880 * t[:int(0.9 * SR)]) * env(int(0.9 * SR), 0.05, 0.4) * 0.15, t0 + 5.6)
# passos
passos(2, [[0, -3.2], [2.6, -0.75]], 0.4); passos(2, [[0, 0.9], [11.8, 0.9], [13.4, 0.15]], 0.3)
passos(3, [[0, -2.6], [7.0, 1.6, 0, 'lin']], 0.45)
# 6 relógio: tique-taque
for k in range(int(CENAS[5][0] * 2)):
    m = int(0.03 * SR); tt = np.arange(m) / SR
    add(np.sin(2 * np.pi * (2200 if k % 2 else 1700) * tt) * env(m, 0.001, 0.006) * 0.35, ini[5] + 0.2 + k * 0.5)
# 7 zumbido subindo, clarão, onda de choque, vidro quebrando
t0 = ini[6] + 0.4; dur = 3.3; n = int(dur * SR); t = np.arange(n) / SR
add(np.sin(2 * np.pi * (120 + 300 * t / dur) * t) * (t / dur) ** 2 * 0.25, t0)
add(bum(3.0, 0.8, 40), ini[6] + 3.7); add(bum(4.0, 1.0, 32), ini[6] + 4.4)
n = int(1.2 * SR); vid = np.zeros(n); idx = rng.integers(0, n, 300); vid[idx] = rng.standard_normal(300)
add((vid - lpf(vid, 0.3)) * env(n, 0.002, 0.3) * 0.9, ini[6] + 4.4)
# zumbido no ouvido (fim da 7 até a 9)
t0 = ini[6] + 5.2; dur = CENAS[6][0] - 5.2 + CENAS[7][0] * 0 + 0.2; n = int(dur * SR); t = np.arange(n) / SR
add(np.sin(2 * np.pi * 3400 * t) * np.interp(t, [0, 0.3, dur - 0.5, dur], [0, 0.05, 0.04, 0]), t0)
# 8 cogumelo: estrondo longe
add(bum(5.0, 0.8, 30), ini[7] + 0.2)
# 9 e 10 zumbido + fogo; 11 fogo e ronco distante
t0 = ini[8]; dur = CENAS[8][0] + CENAS[9][0]; n = int(dur * SR); t = np.arange(n) / SR
add(np.sin(2 * np.pi * 3400 * t) * np.interp(t, [0, 0.3, dur - 1.5, dur], [0, 0.045, 0.03, 0]), t0)
for c in (9, 10, 11): fogo(c, 0.4)
out = np.clip(out, -1, 1); s = (np.stack([out, out], 1) * 32767).astype(np.int16)
w = wave.open("audio/sfx_filme.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
print("sfx", TOT)
