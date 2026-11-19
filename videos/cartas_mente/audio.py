#!/usr/bin/env python3
"""Cartas que leem a mente: montagem.json + sons (virar carta, tiques, ding final)."""
import json, subprocess, sys, os
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.74, 10.1, 12.28, 13.45, 14.75, 16.74, 21.25, 25.45, 27.28]
#     0    1    2    3    4    5    6    7    8    9
P = [0.3, 0.4, 2.2, 2.2, 2.2, 2.2, 0.5, 4.5, 0.8, 2.2]
def vira(x, t, amp=0.18):
    n = int(0.12 * SR); r = np.random.default_rng(int(t * 100)).standard_normal(n).astype(np.float32)
    r = np.convolve(r, np.ones(8) / 8, "same") * np.exp(-np.linspace(0, 6, n))
    put(x, t, r * amp)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(10)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
if __name__ == "__main__":
    os.makedirs("sfx", exist_ok=True)
    tl = montar(); x = novo(tl[-1]["end"])
    fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
    for c in (3, 4, 5, 6):
        vira(x, tl[c - 1]["start"]); tique(x, fim(c) + 0.3, 0.06); tique(x, fim(c) + 1.2, 0.06)
    vira(x, tl[6]["start"] + 0.1); vira(x, tl[6]["start"] + 0.25)
    for k in range(9): tique(x, fim(8) + 0.3 + k * 0.45, 0.05)
    ding(x, tl[8]["start"] + 0.1)
    wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
    tl = montar(True)
    for c in tl: print(c)
