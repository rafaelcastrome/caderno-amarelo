#!/usr/bin/env python3
"""Teste de audição: falas + tons puros (8k, 12k, 14k, 15k, 16k, 17k Hz) como cenas próprias."""
import json, subprocess, os
import numpy as np
from scipy.io import wavfile
SR = 44100
CUTS = [5.09, 7.66, 10.88, 13.67, 15.67, 18.17, 21.72]
TONS = [(8000, 0.12), (12000, 0.16), (14000, 0.18), (15000, 0.2), (16000, 0.22), (17000, 0.24)]
DUR = 3.0
os.makedirs("sfx", exist_ok=True)
for f, a in TONS:
    t = np.arange(int(DUR * SR)) / SR; s = np.sin(2 * np.pi * f * t) * a
    n = int(0.08 * SR); r = np.linspace(0, 1, n); s[:n] *= r; s[-n:] *= r[::-1]
    wavfile.write(f"sfx/tom_{f}.wav", SR, (s * 32767).astype(np.int16))
cenas = [{"fala": 0, "pausa": 0.4}]
for i, (f, a) in enumerate(TONS):
    cenas.append({"fala": i + 1, "pausa": 0.25})
    cenas.append({"arquivo": f"sfx/tom_{f}.wav", "pausa": 0.6})
cenas.append({"fala": 7, "pausa": 2.2})
json.dump({"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": cenas}, open("montagem.json", "w"), indent=1)
subprocess.check_call(["python3", "../_comum/montar.py", "."])
