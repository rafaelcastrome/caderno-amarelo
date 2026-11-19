#!/usr/bin/env python3
"""Carta que adivinha: montagem.json + sons (tiques, rufar, virada da carta, ding)."""
import json, subprocess, sys, os
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.6, 8.4, 10.07, 13.0, 15.8, 20.0, 21.4]
#     0    1    2    3    4    5    6    7
P = [0.3, 1.1, 1.1, 1.3, 1.4, 1.6, 1.2, 2.2]
def vira(x, t, amp=0.2):
    n = int(0.16 * SR); r = np.random.default_rng(7).standard_normal(n).astype(np.float32)
    r = np.convolve(r, np.ones(6) / 6, "same") * np.sin(np.linspace(0, np.pi, n))
    put(x, t, r * amp)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(8)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
if __name__ == "__main__":
    os.makedirs("sfx", exist_ok=True)
    tl = montar(); x = novo(tl[-1]["end"])
    fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
    for c in (2, 3, 4, 5):
        tique(x, fim(c) + 0.2, 0.06); tique(x, fim(c) + 0.7, 0.06)
    a = fim(6) + 0.05; flip = tl[6]["start"] - 0.55
    rufar(x, a, flip)
    vira(x, flip); ding(x, flip + 0.3, 0.12)
    wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
    tl = montar(True)
    for c in tl: print(c)
