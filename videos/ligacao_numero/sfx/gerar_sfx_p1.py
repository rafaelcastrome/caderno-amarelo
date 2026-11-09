#!/usr/bin/env python3
"""Parte 1: corta as falas dos takes (prévia + amigo), filtra as do telefone e gera os efeitos novos."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 44100
rng = np.random.default_rng(7)
def save(n, x): wavfile.write(n, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
def ler(p):
    sr, x = wavfile.read(p); x = x.astype(np.float32) / 32768
    return np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
t = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(4, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(4, [a, b], 'bandpass', fs=SR, output='sos'), x)
def fade(x, a=0.01, r=0.03):
    na, nr = int(a * SR), int(r * SR); x = x.copy(); x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def aparar(x, lim=10 ** (-40 / 20)):
    env = np.convolve(np.abs(x), np.ones(441) / 441, "same"); on = np.where(env > lim)[0]
    return fade(x[max(0, on[0] - 400): on[-1] + 1500])
A, B = ler("falas/take1.wav"), ler("falas/p1/b.wav")
segs = {"a0": (A, 0.3, 3.45), "a1": (A, 3.75, 7.7), "a2": (A, 7.85, 11.3), "a3": (A, 11.95, 12.75),
        "a4": (A, 13.45, 16.4), "a5": (A, 16.6, 18.4), "a6": (A, 18.7, 22.4), "a7": (A, 22.7, len(A) / SR),
        "b0": (B, 0.2, 4.4), "b1": (B, 4.9, 9.3), "b2": (B, 11.7, 16.5), "b3": (B, 17.0, 18.4), "b4": (B, 21.45, 24.36)}
for k, (src, a, b) in segs.items():
    x = aparar(src[int(a * SR):int(b * SR)])
    if k in ("a4", "a6"):  # voz do telefone: a do próprio filho, filtrada como linha
        x = np.tanh(bp(x, 350, 3200) * 4.4) / 2 + rng.normal(0, 0.003, len(x))
    x = x * (0.12 / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * 0.75)
    save(f"falas/p1/{k}.wav", x)
# passos (4 passos abafados)
p = np.zeros(int(2.6 * SR))
for k in range(4):
    i = int((0.25 + k * 0.55) * SR); x = t(0.18); p[i:i + len(x)] += lp(rng.normal(0, 1, len(x)), 300) * np.exp(-x * 28) * 0.9
save("sfx/passos.wav", p)
# vibração de mensagem (2 zumbidos)
v = np.zeros(int(1.6 * SR))
for k in range(2):
    i = int((0.1 + k * 0.45) * SR); x = t(0.3); v[i:i + len(x)] += fade(np.sign(np.sin(2 * np.pi * 150 * x)) * 0.12 * lp(np.ones(len(x)), 900))
save("sfx/vibra.wav", lp(v, 900))
# rua ao longe (grave, sem chiado)
x = t(2.0); save("sfx/rua.wav", fade(lp(rng.normal(0, 1, len(x)), 250) * 0.25, 0.3, 0.3))
# trovão
x = t(3.0); tr = lp(rng.normal(0, 1, len(x)), 140) * (np.exp(-x * 1.6)) * 1.6
tr[:int(0.08 * SR)] += lp(rng.normal(0, 1, int(0.08 * SR)), 1500) * 0.5
save("sfx/trovao.wav", fade(tr, 0.005, 0.5))
# chuva: grave e baixa (sem chiado agudo), 60 s
x = t(60); ch = lp(rng.normal(0, 1, len(x)), 1100) * 0.06
gotas = np.zeros(len(x)); idx = rng.integers(0, len(x) - 400, 2500)
for i in idx: gotas[i:i + 300] += np.exp(-np.arange(300) / 40) * rng.uniform(0.02, 0.06)
save("sfx/chuva.wav", ch + lp(gotas * rng.choice([-1, 1], len(x)), 2500))
# ônibus chegando: motor subindo + freio + porta
x = t(4.2); f0 = 45 + 10 * np.minimum(x / 3, 1)
mot = np.sin(2 * np.pi * np.cumsum(f0) / SR) + 0.5 * np.sin(2 * np.pi * 2 * np.cumsum(f0) / SR)
mot = lp(mot + 0.3 * rng.normal(0, 1, len(x)), 300) * np.minimum(x / 2.5, 1) * 0.5
fr = np.zeros(len(x)); i = int(2.8 * SR); y = t(0.6); fr[i:i + len(y)] = np.sin(2 * np.pi * 1900 * y) * np.exp(-y * 4) * 0.05
po = np.zeros(len(x)); i = int(3.5 * SR); y = t(0.5); po[i:i + len(y)] = lp(rng.normal(0, 1, len(y)), 1800) * np.exp(-y * 6) * 0.25
mot[int(3.2 * SR):] *= np.linspace(1, 0.4, len(x) - int(3.2 * SR))
save("sfx/onibus.wav", fade(mot + fr + po, 0.3, 0.2))
