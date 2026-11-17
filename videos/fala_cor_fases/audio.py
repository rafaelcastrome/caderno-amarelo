#!/usr/bin/env python3
"""Fala a cor da letra (3 fases): montagem.json + tiques a cada palavra + ding no fim de cada fase."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.12, 7.64, 12.29, 17.17]
FASES = [(2, 6, 1.3), (3, 6, 1.0), (4, 8, 0.75)]   # (cena, nº palavras, segundos por palavra)
P = [0.4] + [n * d + 0.5 for _, n, d in FASES] + [2.2]
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(5)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
for c, n, d in FASES:
    t0 = tl[c - 1]["start"] + tl[c - 1]["fala"] + 0.2
    for k in range(n): tique(x, t0 + k * d, 0.09)
    ding(x, t0 + n * d + 0.05)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
for c in montar(True): print(c)
