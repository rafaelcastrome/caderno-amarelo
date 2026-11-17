#!/usr/bin/env python3
"""Quem leva choque: narração (take único Algieba) + tiques da contagem, liga-energia, zap nos passarinhos 2 e 3."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
import numpy as np
from scipy.io import wavfile
from sfx import *
CUTS = [6.1, 7.84, 13.38, 21.92, 29.0, 37.05]
P = [3.9, 1.3, 0.5, 0.5, 0.5, 0.6, 2.4]
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(7)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
def zap(x, t, d=0.8, amp=0.07):  # zumbido elétrico tonal (dente de serra suave a 110 Hz + tremido)
    tt = np.arange(int(d * SR)) / SR
    s = sum(np.sin(2 * np.pi * 110 * k * tt) / k for k in range(1, 9))
    s *= (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 13 * tt))) * np.minimum(1, (d - tt) * 8) * amp
    n = int(0.005 * SR); s[:n] *= np.linspace(0, 1, n); put(x, t, s.astype(np.float32))
tl = montar(); x = novo(tl[-1]["end"])
c1 = tl[0]; t0 = c1["start"] + c1["fala"] + 0.25
for k in range(3): tique(x, t0 + k * 1.2, 0.09)
bumbo(x, tl[1]["start"] + 0.35); ding(x, tl[1]["start"] + 0.45, 0.06)
ding(x, tl[2]["start"] + tl[2]["fala"] * 0.12, 0.07)
zap(x, tl[3]["start"] + tl[3]["fala"] * 0.13)
zap(x, tl[4]["start"] + tl[4]["fala"] * 0.12)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
for c in montar(True): print(c)
