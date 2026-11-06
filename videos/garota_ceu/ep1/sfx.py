# Trilha e efeitos do Ep. 1 (numpy). A montagem abaixa tudo isso por baixo da voz (sidechain).
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
# 1 queda: vento forte
vento(C(1), D(1), 0.5)
# 2-5 caixinha de música (melodia de Natal de domínio público, Noite Feliz)
G4, A4, E4, D5, B4, C5 = 392, 440, 330, 587, 494, 523
noite = [(G4, 1.5), (A4, .5), (G4, 1), (E4, 3), (G4, 1.5), (A4, .5), (G4, 1), (E4, 3), (D5, 2), (D5, 1), (B4, 3), (C5, 2), (C5, 1), (G4, 3)]
caixinha(C(2, 0.3), noite + noite[:8], 0.07)
helice(C(3), D(3), 0.05); helice(C(5), D(5), 0.07); baque(C(5, 1.2), 0.15, 900)
# 6 chuva e grave começando
chuva(C(6), D(6) + D(7) + D(8), 0.12); drone(C(6, 0.5), D(6) + D(7) + D(8) - 0.5, 0.05, 0.22)
# 7 turbulência
for k in range(7): baque(C(7, 0.3 + k * 0.7 + rng.random() * 0.2), 0.45, 45 + rng.random() * 30)
# 8 trovões nos clarões
for a in (0.5, 1.7, 2.9): trovao(C(8, a + 0.1), 0.45)
# 9 silêncio: só ronco abafado e batimento
helice(C(9), D(9), 0.03)
for k in range(5): batida(C(9, 0.6 + k * 1.05), 0.3)
# 10 o raio na asa
estalo(C(10, 2.25), 0.9)
# 11 o avião se parte
bum(C(11, 0.5), 3.4, 0.75)
# 12-13 só vento, crescendo e cortando no preto
vento(C(12), D(12), 0.35); vento(C(13), D(13) - 0.45, 0.55, sobe=True)
# 14 um segundo de silêncio e a floresta entra
floresta(C(14, 1.0), D(14) - 1.0 + D(15) + D(16) + D(17), 0.18)
# 15 uma nota de piano quando ela abre os olhos
piano(C(15, 1.9), 262, 0.16); piano(C(15, 2.0), 392, 0.08)
# 16-17 cordas graves
drone(C(16, 0.4), D(16) + D(17) - 0.6, 0.1, 0.16, 49)
for k in range(4): batida(C(17, 0.8 + k * 1.3), 0.2)
out = np.clip(out, -1, 1); s = (np.stack([out, out], 1) * 32767).astype(np.int16)
w = wave.open("audio/sfx.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
print("sfx", TOT)
