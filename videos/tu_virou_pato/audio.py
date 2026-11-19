#!/usr/bin/env python3
"""Tu virou PATO: montagem.json + sons (tiques, plim nas letras, quá-quá no PATO)."""
import json, subprocess, sys, os
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [4.43, 9.6, 16.2, 19.24, 22.06, 26.88, 31.5, 36.5, 41.41, 47.52]
#     0    1    2    3    4    5    6    7    8    9    10
P = [0.3, 1.7, 1.7, 2.3, 1.7, 1.7, 0.6, 0.5, 0.7, 0.6, 2.2]
L8 = [0.0, 1.3, 2.25, 3.05]          # Penúltimo, Abril, Três, Ovo (s dentro da fala 8)
L9 = [0.15, 0.85, 1.5, 2.3, 3.0]     # P, A, T, O, "tu virou PATO"
def qua(x, t, amp=0.16):
    for k, d in enumerate((0.0, 0.24)):
        n = int(0.17 * SR); tt = np.arange(n) / SR
        f = 520 - 180 * tt / 0.17
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(h * ph) / h for h in range(1, 12))       # serra = som anasalado
        s *= np.exp(-tt * 9) * (1 - np.exp(-tt * 200))
        s = np.convolve(s, np.ones(4) / 4, "same")
        put(x, t + d, (s * amp).astype(np.float32))
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(11)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
if __name__ == "__main__":
    os.makedirs("sfx", exist_ok=True)
    tl = montar(); x = novo(tl[-1]["end"])
    fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
    for k in range(5): tique(x, fim(4) + 0.15 + k * 0.4)
    for c in (2, 3, 5, 6):
        tique(x, fim(c) + 0.1, 0.06); tique(x, fim(c) + 0.7, 0.06); tique(x, fim(c) + 1.3, 0.06)
    for d in L8: tique(x, tl[7]["start"] + d, 0.08)
    for d in L9[:4]: ding(x, tl[8]["start"] + d, 0.08)
    qua(x, tl[8]["start"] + L9[4] + 0.9)
    for c in (10,): ding(x, tl[c - 1]["start"] + 0.05)
    wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
    tl = montar(True)
    for c in tl: print(c)
