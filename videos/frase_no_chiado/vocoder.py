#!/usr/bin/env python3
"""Vocoder de ruído: transforma a frase falada num chiado (fala com poucas bandas de ruído).
uso: vocoder.py entrada.wav saida.wav [bandas=3] [corte_envelope_hz=30]"""
import sys, subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt
SR = 44100
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
x = np.frombuffer(raw, np.float32).astype(np.float64)
nb = int(sys.argv[3]) if len(sys.argv) > 3 else 3
fc = float(sys.argv[4]) if len(sys.argv) > 4 else 30
edges = np.geomspace(100, 7000, nb + 1)
rng = np.random.default_rng(7)
out = np.zeros_like(x)
lp = butter(4, fc, "low", fs=SR, output="sos")
for lo, hi in zip(edges[:-1], edges[1:]):
    bp = butter(4, [lo, hi], "band", fs=SR, output="sos")
    env = np.maximum(sosfiltfilt(lp, np.abs(sosfiltfilt(bp, x))), 0)
    out += sosfiltfilt(bp, rng.standard_normal(len(x))) * env
out *= 0.5 / np.max(np.abs(out))
n = int(0.02 * SR); r = np.linspace(0, 1, n); out[:n] *= r; out[-n:] *= r[::-1]
wavfile.write(sys.argv[2], SR, (out * 32767).astype(np.int16))
