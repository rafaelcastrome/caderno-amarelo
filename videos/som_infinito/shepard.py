#!/usr/bin/env python3
"""Escala de Shepard subindo sem fim (notas de 0,42 s, 12 por oitava), em loop perfeito.
uso: shepard.py saida.wav [segundos=60]"""
import sys
import numpy as np
from scipy.io import wavfile
SR = 44100; NOTA = 0.42; dur = float(sys.argv[2]) if len(sys.argv) > 2 else 60
n_notas = int(dur / NOTA); L = int(NOTA * SR)
f0, oitavas = 32.7, 8; centro = np.log2(f0) + oitavas / 2
t = np.arange(L) / SR
env_t = np.minimum(1, np.minimum(t / 0.02, (NOTA - t) / 0.06))
out = []
for k in range(n_notas):
    s = k % 12; nota = np.zeros(L)
    for o in range(oitavas):
        f = f0 * 2 ** (o + s / 12)
        amp = np.exp(-0.5 * ((np.log2(f) - centro) / 1.1) ** 2)
        nota += amp * np.sin(2 * np.pi * f * t)
    out.append(nota * env_t)
x = np.concatenate(out); x *= 0.6 / np.max(np.abs(x))
wavfile.write(sys.argv[1], SR, (x * 32767).astype(np.int16))
