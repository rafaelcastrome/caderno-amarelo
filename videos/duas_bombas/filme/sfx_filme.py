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
# passos
passos(3, [[0, 3.4], [2.6, 0.75]], 0.35)
passos(4, [[0, -2.4], [1.0, -0.85], [7.3, -0.85], [9.0, -3.6]]); passos(4, [[0, -1.6], [2.2, 0.75], [7.8, 0.75], [9.0, 2.4]], 0.35)
passos(5, [[0, -2.7], [6.6, 2.1, 0, 'lin']]); passos(6, [[0, -1.4], [1.1, -0.4]])
# avião: ronco grave de 4 motores (6 e 7)
t0 = ini[5]; dur = CENAS[5][0] + CENAS[6][0]; n = int(dur * SR); t = np.arange(n) / SR
ron = sum(np.sign(np.sin(2 * np.pi * f * t + p)) for f, p in [(62, 0), (63.3, 1), (93.5, 2), (124.6, .5)]) * 0.25
ron = lpf(ron, 0.03) * (1 + 0.3 * np.sin(2 * np.pi * 7.5 * t))
vol = np.interp(t, [0, 2.5, CENAS[5][0], CENAS[5][0] + 0.2, dur - 1, dur], [0, 0.5, 0.6, 0.9, 0.7, 0.3])
add(ron * vol, t0, 0.9)
# assobio da bomba caindo (cena 7, a partir de 1.0)
t0 = ini[6] + 1.0; dur = CENAS[6][0] - 1.0 + 0.3; n = int(dur * SR); t = np.arange(n) / SR
fr = 1500 * (1 - 0.55 * t / dur); ph = 2 * np.pi * np.cumsum(fr) / SR
add(np.sin(ph) * np.interp(t, [0, 0.5, dur - 0.2, dur], [0, 0.25, 0.5, 0]), t0, 0.7)
# explosão: clarão (0.6) e onda de choque (2.25) na cena 8
def bum(dur, g, grave=40):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lpf(rng.standard_normal(n), 0.02) * 6 + np.sin(2 * np.pi * grave * t * (1 - 0.3 * t / dur)) * 0.8
    return np.tanh(x * env(n, 0.01, dur / 4)) * g
add(bum(3.5, 0.9, 38), ini[7] + 0.6)
add(bum(5.0, 1.0, 32), ini[7] + 2.2)
n = int(2.5 * SR); add(lpf(rng.standard_normal(n), 0.12) * env(n, 0.05, 0.5) * 0.6, ini[7] + 2.1)  # vento/destroços
# zumbido no ouvido depois do impacto (cena 8 fim até cena 9)
t0 = ini[7] + 3.1; dur = CENAS[7][0] - 3.1 + CENAS[8][0]; n = int(dur * SR); t = np.arange(n) / SR
add(np.sin(2 * np.pi * 3400 * t) * np.interp(t, [0, 0.3, dur - 1.5, dur], [0, 0.05, 0.03, 0]), t0)
# fogo crepitando (cenas 9 e 10)
t0 = ini[8]; dur = CENAS[8][0] + CENAS[9][0]; n = int(dur * SR)
cr = np.zeros(n); idx = rng.integers(0, n, int(dur * 25)); cr[idx] = rng.standard_normal(len(idx))
cr = lpf(cr, 0.3) * 0.8 + lpf(rng.standard_normal(n), 0.01) * 0.6
add(cr * np.interp(np.arange(n) / SR, [0, 1, dur - 1, dur], [0, 0.5, 0.5, 0]), t0)
out = np.clip(out, -1, 1); s = (np.stack([out, out], 1) * 32767).astype(np.int16)
w = wave.open("audio/sfx_filme.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
print("sfx", TOT)
