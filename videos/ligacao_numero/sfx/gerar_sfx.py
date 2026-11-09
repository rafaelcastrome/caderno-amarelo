#!/usr/bin/env python3
"""Toque de celular, bipes de chamada encerrada, fundo de suspense e o take com as falas do 'telefone' filtradas."""
import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 44100
def save(n, x): wavfile.write(n, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
t = lambda d: np.arange(int(d * SR)) / SR
def env(x, a=0.01, r=0.05):
    n = len(x); e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] = np.linspace(1, 0, nr); return x * e
# toque: 2 toques de marimba (notas curtas), 1,3 s cada
notas = [880, 1175, 1480, 1175, 880, 1480]
toque = []
for _ in range(2):
    for f in notas:
        tt = t(0.16); s = np.sin(2*np.pi*f*tt) + 0.3*np.sin(2*np.pi*2*f*tt)
        toque.append(env(s * np.exp(-tt*14), 0.003, 0.03) * 0.45)
    toque.append(np.zeros(int(0.35 * SR)))
save("sfx/toque.wav", np.concatenate(toque))
# chamada encerrada: 3 bipes
b = []
for _ in range(3):
    tt = t(0.18); b += [env(np.sin(2*np.pi*620*tt)*0.35, 0.005, 0.02), np.zeros(int(0.12*SR))]
save("sfx/desliga.wav", np.concatenate(b))
# fundo: drone grave + batida de coração leve, 40 s
tt = t(40)
dr = 0.10*np.sin(2*np.pi*55*tt) + 0.06*np.sin(2*np.pi*82.4*tt + 0.5*np.sin(2*np.pi*0.1*tt)) + 0.03*np.sin(2*np.pi*110.3*tt)
dr *= 0.7 + 0.3*np.sin(2*np.pi*0.07*tt)
hb = np.zeros_like(tt)
for k in np.arange(0, 40, 1.0):
    for off, g in [(0, 1), (0.22, 0.6)]:
        i = int((k + off) * SR); x = t(0.15); hb[i:i+len(x)] += g*np.sin(2*np.pi*48*x)*np.exp(-x*30)*0.5
save("sfx/fundo.wav", dr + hb*0.6)
# take com as falas do telefone (voz do próprio filho, "do futuro") filtradas
sr, x = wavfile.read("falas/take1.wav"); x = x.astype(np.float32)/32768
sos = butter(4, [350, 3200], 'bandpass', fs=sr, output='sos')
for a, bb in [(13.3, 16.4), (18.6, 22.5)]:
    i, j = int(a*sr), int(bb*sr); seg = sosfilt(sos, x[i:j]) * 2.2
    seg = np.tanh(seg * 2.0) / 2.0
    seg += np.random.default_rng(1).normal(0, 0.004, len(seg))  # chiado leve de linha
    x[i:j] = seg
wavfile.write("falas/take_tel.wav", sr, (np.clip(x, -1, 1)*32767).astype(np.int16))
