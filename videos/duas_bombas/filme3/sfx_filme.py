# Efeitos da parte 3 (numpy), bem baixinhos: passos, fogo, grilos, navio, carimbo, brilho.
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
def sino(t, f=880, g=0.12, d=1.6):
    n = int(d * SR); tt = np.arange(n) / SR
    add((np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt)) * env(n, 0.003, d / 4) * g, t)
def carimbo(t, g=0.5):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    add((np.sin(2 * np.pi * 70 * tt) * env(n, 0.002, 0.05) + lpf(rng.standard_normal(n), 0.1) * env(n, 0.001, 0.02)) * g, t)
# 1 fogo baixinho na cidade destruída + passos indo embora
fogo(1, 0.12); passos(1, [[0, -0.3], [6.8, -0.3], [11.0, -3.4]], 0.3)
# 2 passos dele e dela
passos(2, [[0, -3.4], [2.6, -0.6], [12.2, -0.6], [13.8, 0.42]], 0.3); passos(2, [[0, 3.8], [5.0, 3.8], [8.6, 1.1], [13.8, 1.05]], 0.22)
fogo(2, 0.08)
# 3 noite: grilos bem baixinhos
t0 = ini[2]; dur = CENAS[2][0]; n = int(dur * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * 4200 * tt) * (np.sin(2 * np.pi * 30 * tt) > 0.3) * ((tt % 0.9) < 0.25) * np.interp(tt, [0, 0.5, dur - 0.5, dur], [0, 0.02, 0.02, 0]), t0)
# 5 família andando + apito do navio
for x0 in (-2.2, -3.0, -1.5, -0.95): passos(5, [[0, x0], [CENAS[4][0], x0 + 2.8]], 0.15)
n = int(1.4 * SR); tt = np.arange(n) / SR
add((np.sin(2 * np.pi * 110 * tt) + 0.5 * np.sin(2 * np.pi * 165 * tt)) * np.interp(tt, [0, 0.15, 1.1, 1.4], [0, 0.1, 0.1, 0]), ini[4] + 3.4)
# 6 carimbo NAGASAKI e o "?"
carimbo(ini[5] + 1.2, 0.45); sino(ini[5] + 3.6, 520, 0.06)
# 7 passos lentos do velhinho e o carimbo HIROSHIMA
passos(7, [[0, -3.4], [5.0, -0.8]], 0.2); carimbo(ini[6] + 6.55, 0.6); sino(ini[6] + 6.7, 660, 0.08, 2.4)
# 8 estrela: brilho
for k, f in enumerate((660, 880, 1320)): sino(ini[7] + 0.3 + k * 0.12, f, 0.07)
# 11 FIM: brilho
for k, f in enumerate((523, 659, 784)): sino(ini[10] + 0.8 + k * 0.15, f, 0.06)
out = np.clip(out, -1, 1); s = (np.stack([out, out], 1) * 32767).astype(np.int16)
w = wave.open("audio/sfx_filme.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
print("sfx", TOT)
