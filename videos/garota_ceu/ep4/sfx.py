# Trilha e efeitos do Ep. 4 (numpy). A montagem abaixa tudo isso por baixo da voz (sidechain).
import numpy as np, wave
from scipy.signal import lfilter
from build import CENAS
SR = 44100; ini = np.cumsum([0] + [c[0] for c in CENAS]); TOT = ini[-1]
out = np.zeros(int(TOT * SR) + SR); rng = np.random.default_rng(5)
def add(sig, t, g=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i); out[i:i + n] += sig[:n] * g
def lp(x, a): return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def env(n, at, dec): t = np.arange(n) / SR; return np.minimum(1, t / max(at, 1e-4)) * np.exp(-t / dec)
def rampa(n, pts): t = np.arange(n) / SR; return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
def C(c, a=0.0): return ini[c - 1] + a
def D(c): return CENAS[c - 1][0]
def vento(t0, dur, g, sobe=False):
    n = int(dur * SR); x = lp(rng.standard_normal(n), 0.03) * 3; m = 1 + 0.4 * np.sin(2 * np.pi * 0.3 * np.arange(n) / SR)
    e = rampa(n, [(0, 0.3 if sobe else 1), (dur - 0.05, 1), (dur, 0)]) if sobe else rampa(n, [(0, 0), (0.2, 1), (dur - 0.3, 1), (dur, 0)])
    add(x * m * e, t0, g)
def caixinha(t0, notas, g=0.08, passo=0.42):  # caixinha de música
    for k, (f, d) in enumerate(notas):
        n = int(1.4 * SR); tt = np.arange(n) / SR
        add((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 3.01 * tt)) * env(n, 0.002, 0.35), t0 + sum(x[1] for x in notas[:k]) * passo, g)
def helice(t0, dur, g):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 0.02) * 2 * (1 + 0.5 * np.sin(2 * np.pi * 18 * tt)) + 0.3 * np.sin(2 * np.pi * 72 * tt)
    add(x * rampa(n, [(0, 0), (0.3, 1), (dur - 0.3, 1), (dur, 0)]), t0, g)
def baque(t, g=0.5, f=60):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    add((np.sin(2 * np.pi * f * tt) * env(n, 0.003, 0.08) + lp(rng.standard_normal(n), 0.15) * env(n, 0.001, 0.04)), t, g)
def trovao(t, g=0.6, dur=2.4):
    n = int(dur * SR); x = lp(rng.standard_normal(n), 0.008) * 10
    add(np.tanh(x * env(n, 0.05, dur / 3)), t, g)
def estalo(t, g=0.8):
    n = int(0.5 * SR); x = hp(rng.standard_normal(n), 0.3) * env(n, 0.0005, 0.03) + lp(rng.standard_normal(n), 0.05) * 4 * env(n, 0.002, 0.15)
    add(np.tanh(x), t, g)
def bum(t, dur, g):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 0.015) * 8 + np.sin(2 * np.pi * 38 * tt * (1 - 0.3 * tt / dur)) * 0.8
    metal = sum(np.sin(2 * np.pi * f * tt) for f in (310, 447, 523)) * 0.12 * env(n, 0.05, 0.8) * (1 + np.sin(2 * np.pi * 7 * tt))
    add(np.tanh(x * env(n, 0.01, dur / 4)) + metal, t, g)
def drone(t0, dur, g0, g1, f=55):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + h) / h for h in (1, 2, 3, 4)) + 0.5 * np.sin(2 * np.pi * f * 1.5 * tt)
    add(lp(x, 0.05) * rampa(n, [(0, 0), (0.6, g0), (dur - 0.1, g1), (dur, 0)]), t0, 1)
def batida(t, g=0.35):
    for k, a in ((0, 1), (0.22, 0.7)):
        n = int(0.25 * SR); tt = np.arange(n) / SR; add(np.sin(2 * np.pi * 48 * tt) * env(n, 0.004, 0.06), t + k, g * a)
def chuva(t0, dur, g):
    n = int(dur * SR); x = np.zeros(n); idx = rng.integers(0, n, int(dur * 400)); x[idx] = rng.standard_normal(len(idx))
    add((hp(lp(x, 0.4), 0.05) + lp(rng.standard_normal(n), 0.2) * 0.3) * rampa(n, [(0, 0), (0.5, 1), (dur - 0.2, 1), (dur, 0)]), t0, g)
def floresta(t0, dur, g):
    n = int(dur * SR); tt = np.arange(n) / SR
    ins = np.sin(2 * np.pi * 4800 * tt) * (np.sin(2 * np.pi * 38 * tt) > 0.4) * ((tt % 1.3) < 0.5) * 0.08
    x = ins + lp(rng.standard_normal(n), 0.03) * 0.3
    add(x * rampa(n, [(0, 0), (1.5, 1), (dur - 0.2, 1), (dur, 0)]), t0, g)
    for k in range(int(dur * 1.2)):  # passarinhos e gotas
        tk = t0 + 0.6 + rng.random() * (dur - 1); m = int(0.18 * SR); u = np.arange(m) / SR; f = 2600 + rng.random() * 1800
        add(np.sin(2 * np.pi * (f + 900 * np.sin(2 * np.pi * 14 * u)) * u) * env(m, 0.01, 0.05), tk, g * 0.5)
        add(np.sin(2 * np.pi * (900 + 600 * rng.random()) * u * (1 - u * 2)) * env(m, 0.001, 0.02), t0 + rng.random() * dur, g * 0.4)
def piano(t, f, g=0.18, d=3.0):
    n = int(d * SR); tt = np.arange(n) / SR
    add((np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) + 0.2 * np.sin(2 * np.pi * 3 * f * tt)) * env(n, 0.004, d / 4), t, g)
def agua(t0, dur, g):  # riacho: chiado grave borbulhando
    n = int(dur * SR); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 0.08) * (1 + 0.6 * np.sin(2 * np.pi * 3.1 * tt) * np.sin(2 * np.pi * 0.7 * tt))
    for k in range(int(dur * 6)):
        m = int(0.06 * SR); u = np.arange(m) / SR; f = 500 + rng.random() * 700
        add(np.sin(2 * np.pi * f * u * (1 + 4 * u)) * env(m, 0.002, 0.015), t0 + rng.random() * dur, g * 0.6)
    add(x * rampa(n, [(0, 0), (1.2, 1), (dur - 0.3, 1), (dur, 0)]), t0, g)
def risco(t0, dur, g):  # graveto riscando a terra
    n = int(dur * SR); tt = np.arange(n) / SR
    add(hp(rng.standard_normal(n), 0.4) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt)) * rampa(n, [(0, 0), (0.05, 1), (dur - 0.05, 1), (dur, 0)]), t0, g)
def saquinho(t0, g):
    for k in range(6):
        m = int(0.08 * SR); add(hp(rng.standard_normal(m), 0.25) * env(m, 0.002, 0.02), t0 + k * 0.07 + rng.random() * 0.03, g)
def passo(t, g=0.12):
    m = int(0.12 * SR); add(lp(rng.standard_normal(m), 0.1) * env(m, 0.002, 0.03), t, g)
def splash(t, g):
    n = int(0.9 * SR); add(lp(hp(rng.standard_normal(n), 0.05), 0.4) * env(n, 0.005, 0.18), t, g)
def vozes(t0, dur, g):  # murmúrio de vozes ao longe (formantes graves, sem palavras)
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for f0, ph in ((115, 0), (135, 1.3), (98, 2.1)):
        silab = (np.sin(2 * np.pi * (3.2 + ph * 0.3) * tt + ph) > 0.1) * (np.sin(2 * np.pi * 0.4 * tt + ph) > -0.3)
        x += lp(np.sign(np.sin(2 * np.pi * f0 * (1 + 0.05 * np.sin(2 * np.pi * 2.3 * tt)) * tt)) * silab, 0.05)
    add(lp(x, 0.08) * rampa(n, [(0, 0), (0.5, 1), (dur - 0.4, 1), (dur, 0)]), t0, g)
# 1-2 floresta e rio perto da cabana
floresta(C(1), D(1) + D(2) + D(3) + D(4) + D(5), 0.13); agua(C(1), D(1) + D(2) + D(3) + D(4) + D(5) + D(6), 0.06)
# 3 vozes de gente chegando (entra junto com a fala "Voz de gente")
vozes(C(2, D(2) - 0.6), 0.6 + D(3) + 1.0, 0.05)
for k in range(10): passo(C(3, 0.2 + k * 0.32), 0.1)
# 4 o susto
baque(C(4, 1.25), 0.2, 90)
# 6 remos na água
for k in range(6): splash(C(6, 0.5 + k * 1.0), 0.08)
# 7 aviãozinho, depois o hospital
helice(C(7), 2.6, 0.07)
piano(C(7, 4.0), 262, 0.12); piano(C(7, 4.1), 330, 0.08); piano(C(7, 4.2), 392, 0.06)
# 8-9 a notícia: grave e notas lentas
drone(C(8), D(8) + D(9) + D(10), 0.08, 0.16, 49)
for k, f in enumerate([220, 196, 175, 165, 147, 131]): piano(C(9, 0.8 + k * 1.7), f, 0.08, 3.0)
# 10 ela sai da floresta
floresta(C(10), D(10), 0.1)
# 11-13 recomeço: piano subindo
for k, f in enumerate([262, 330, 392, 440, 392, 523, 494, 440, 392, 523, 587, 659]): piano(C(11, 0.4 + k * 1.15), f, 0.08, 2.5)
floresta(C(12), D(12) + D(13) + D(14), 0.12)
# 14 pulso pra pergunta final
drone(C(14, 0.2), D(14) - 0.3, 0.08, 0.14, 55)
for k in range(8): batida(C(14, 0.8 + k * 1.5), 0.15)
out = np.clip(out, -1, 1); s = (np.stack([out, out], 1) * 32767).astype(np.int16)
w = wave.open("audio/sfx.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
print("sfx", TOT)
